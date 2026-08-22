import React, { useState, useEffect } from 'react';

interface DbUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  created_at: string;
  submissions_count: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('Credit & Loan Operations');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/auth/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password: password || 'password123',
          role,
          department,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create user');
      }

      setMessage('User created and stored in PostgreSQL successfully!');
      setFullName('');
      setEmail('');
      setPassword('');
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'risk_officer':
        return 'bg-secondary/15 text-secondary border border-secondary/30 font-bold';
      case 'employee':
        return 'bg-tertiary-container/10 text-on-tertiary-container border border-tertiary-fixed-dim/40 font-bold';
      case 'admin':
      default:
        return 'bg-primary-container/10 text-primary-container border border-primary-container/30 font-bold';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Staff Account Management</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Registered personnel and access roles fetched directly from PostgreSQL database.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New User Account
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-xs font-semibold text-on-surface">
          {message}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading user accounts from database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Submissions Count</th>
                  <th className="px-5 py-3.5 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-on-surface">{u.full_name}</p>
                      <p className="text-[11px] text-on-surface-variant">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface font-medium">{u.department}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-on-tertiary-container">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-on-surface">
                      {u.submissions_count || '0'}
                    </td>
                    <td className="px-5 py-4 text-right text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
              <h3 className="text-lg font-bold text-on-surface">Create New User Account</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-on-surface-variant mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Eric Karasira"
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eric@sagerganza.rw"
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-on-surface-variant mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defaults to password123"
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-on-surface-variant mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none"
                >
                  <option value="employee">Loan & Credit Officer (Employee)</option>
                  <option value="risk_officer">Risk & Compliance Officer</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-on-surface-variant mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Credit & Loan Operations"
                  className="w-full h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-xs hover:bg-primary/90"
                >
                  {saving ? 'Creating in PostgreSQL...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
