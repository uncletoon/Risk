import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1320] flex items-center justify-center p-4 sm:p-6 font-body-md text-on-surface antialiased">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        
        {/* Left Side: Brand Identity (5 cols) */}
        <div className="lg:col-span-5 bg-primary-container p-8 sm:p-10 flex flex-col justify-between text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary font-bold text-lg shadow-md">
                E
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">ERIDSS</h1>
                <p className="text-[10px] text-on-primary-container tracking-wider uppercase font-semibold">Risk Intelligence System</p>
              </div>
            </div>

            <div className="space-y-3 my-6">
              <h2 className="text-xl font-bold text-white leading-snug">
                Risk Management & Intelligence Platform
              </h2>
              <p className="text-xs text-on-primary-container leading-relaxed">
                Role-based portal for frontline incident reporting, custom underwriting rules, and predictive risk analysis.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-on-primary-container space-y-1">
            <p className="font-semibold text-white">Prototype Credentials Reference:</p>
            <p>• Employee: <code className="text-secondary font-data-mono">loan.officer@sagerganza.rw</code></p>
            <p>• Risk Officer: <code className="text-secondary font-data-mono">risk.officer@sagerganza.rw</code></p>
            <p>• Administrator: <code className="text-secondary font-data-mono">admin@sagerganza.rw</code></p>
            <p className="text-[11px] text-on-primary-container/80 pt-1">Default Password: <code className="text-white font-data-mono">password123</code></p>
          </div>
        </div>

        {/* Right Side: Standard Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-surface-bright">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary">Sign In</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter your account credentials to access your portal.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-error-container/30 border border-error/30 text-on-error-container text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-error">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sagerganza.rw"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary shadow-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary shadow-xs outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
