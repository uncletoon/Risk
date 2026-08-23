import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, Plus, ShieldCheck, UserCheck, Mail, Building2, CheckCircle2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Officer@123');
  const [role, setRole] = useState('RISK_OFFICER');
  const [department, setDepartment] = useState('Corporate Risk');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const list = await api.getAdminUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.createAdminUser({
        fullName,
        email,
        password,
        role,
        department,
      });
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              System Administration
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary">Staff User Accounts</h1>
          <p className="text-xs text-on-surface-variant">
            Manage user roles (SYSTEM_ADMIN, RISK_OFFICER), corporate credentials, and organizational access.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add User Account</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-on-surface-variant">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-6 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Corporate Email</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low">
                    <td className="py-4 px-6 font-bold text-primary">{u.full_name}</td>
                    <td className="py-4 px-4 text-on-surface font-medium">{u.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'SYSTEM_ADMIN'
                            ? 'bg-primary-container/20 text-primary border-primary-container/40'
                            : 'bg-secondary-container/20 text-secondary border-secondary-container/40'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{u.department}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/20 text-on-tertiary-container border border-tertiary-fixed-dim/30">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-primary">Provision New User Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  >
                    <option value="RISK_OFFICER">RISK_OFFICER</option>
                    <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container font-bold text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
