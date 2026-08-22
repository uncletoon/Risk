import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'risk_officer' | 'employee';
  department: string;
  status?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  loading: false,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eridss_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eridss_token') || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile directly with PostgreSQL database on startup
  useEffect(() => {
    const refreshUserFromDb = async () => {
      const storedToken = localStorage.getItem('eridss_token');
      if (!storedToken) return;

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const freshUser = await res.json();
          setUser(prev => ({ ...freshUser, token: storedToken }));
          localStorage.setItem('eridss_user', JSON.stringify({ ...freshUser, token: storedToken }));
        } else if (res.status === 401) {
          logout();
        }
      } catch (err) {
        console.error('Failed to sync user with database:', err);
      }
    };

    refreshUserFromDb();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Invalid email or password');
      }

      const data = await res.json();
      setUser(data);
      setToken(data.token);
      localStorage.setItem('eridss_user', JSON.stringify(data));
      localStorage.setItem('eridss_token', data.token);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eridss_user');
    localStorage.removeItem('eridss_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
