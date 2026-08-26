import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateRequired,
} from '../../lib/validation';
import { Users, Plus, Phone, AlertCircle, User as UserIcon, Mail, Lock, Building } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('Officer@123');
  const [role, setRole] = useState('RISK_OFFICER');
  const [department, setDepartment] = useState('Corporate Risk');
  const [saving, setSaving] = useState(false);

  // Errors State
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

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

  const handleNameChange = (val: string) => {
    setFullName(val);
    const res = validateFullName(val);
    setNameError(res.error);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const res = validateEmail(val, true);
    setEmailError(res.error);
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const res = validatePhoneNumber(val);
    setPhoneError(res.error);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    const res = validatePassword(val);
    setPasswordError(res.error);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    const res = validateRequired(val, 'Department', 2);
    setDepartmentError(res.error);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('Officer@123');
    setRole('RISK_OFFICER');
    setDepartment('Corporate Risk');
    setNameError(null);
    setEmailError(null);
    setPhoneError(null);
    setPasswordError(null);
    setDepartmentError(null);
    setIsModalOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRes = validateFullName(fullName);
    const emailRes = validateEmail(email, true);
    const phoneRes = validatePhoneNumber(phoneNumber);
    const passRes = validatePassword(password);
    const deptRes = validateRequired(department, 'Department', 2);

    setNameError(nameRes.error);
    setEmailError(emailRes.error);
    setPhoneError(phoneRes.error);
    setPasswordError(passRes.error);
    setDepartmentError(deptRes.error);

    if (!nameRes.isValid || !emailRes.isValid || !phoneRes.isValid || !passRes.isValid || !deptRes.isValid) {
      return;
    }

    try {
      setSaving(true);
      await api.createAdminUser({
        fullName,
        email,
        phoneNumber,
        gender,
        password,
        role,
        department,
      });
      resetForm();
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const hasFormErrors = Boolean(nameError || emailError || phoneError || passwordError || departmentError);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              System Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Staff User Accounts</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
            Manage user identity, phone, gender, corporate credentials, and organizational access.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add User Account</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-primary">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wider text-primary font-black">
                  <th className="py-3.5 px-6 font-bold">User Name</th>
                  <th className="py-3.5 px-4 font-bold">Corporate Email</th>
                  <th className="py-3.5 px-4 font-bold">Phone Number</th>
                  <th className="py-3.5 px-4 font-bold">Gender</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 font-bold text-primary flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                        {u.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-4 px-4 text-primary font-semibold">{u.email}</td>
                    <td className="py-4 px-4 text-on-surface font-medium">{u.phone_number || '—'}</td>
                    <td className="py-4 px-4 text-on-surface font-medium">{u.gender || '—'}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          u.role === 'SYSTEM_ADMIN'
                            ? 'bg-primary-container/20 text-primary border-primary-container/40'
                            : 'bg-secondary-container/20 text-secondary border-secondary-container/40'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-on-surface font-medium">{u.department}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-tertiary-container/20 text-on-tertiary-container border border-tertiary-fixed-dim/40">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-medium">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-primary">Provision New User Account</h3>
              <button onClick={resetForm} className="text-primary hover:text-error text-lg cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} noValidate className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-primary uppercase tracking-wider">
                    Full Name <span className="text-secondary">*</span>
                  </label>
                  {nameError && <span className="text-[10px] font-bold text-red-500">Invalid</span>}
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    nameError
                      ? 'border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400'
                      : 'bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary'
                  }`}
                  placeholder="e.g. Jean Damascene"
                />
                {nameError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Corporate Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-primary uppercase tracking-wider">
                    Corporate Email <span className="text-secondary">*</span>
                  </label>
                  {emailError && <span className="text-[10px] font-bold text-red-500">Invalid</span>}
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    emailError
                      ? 'border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400'
                      : 'bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary'
                  }`}
                  placeholder="e.g. jean@enterprise.rw"
                />
                {emailError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Phone & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-primary uppercase tracking-wider">
                      Phone Number
                    </label>
                    {phoneError && <span className="text-[10px] font-bold text-red-500">Invalid</span>}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      phoneError
                        ? 'border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400'
                        : 'bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary'
                    }`}
                    placeholder="+250 788 000 000"
                  />
                  {phoneError && (
                    <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-primary uppercase tracking-wider">
                    Initial Password <span className="text-secondary">*</span>
                  </label>
                  {passwordError && <span className="text-[10px] font-bold text-red-500">Invalid</span>}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    passwordError
                      ? 'border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400'
                      : 'bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary'
                  }`}
                />
                {passwordError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="RISK_OFFICER">RISK_OFFICER</option>
                    <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-primary uppercase tracking-wider">
                      Department <span className="text-secondary">*</span>
                    </label>
                    {departmentError && <span className="text-[10px] font-bold text-red-500">Invalid</span>}
                  </div>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      departmentError
                        ? 'border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400'
                        : 'bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary'
                    }`}
                  />
                  {departmentError && (
                    <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>{departmentError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-surface-container font-bold text-primary cursor-pointer hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || hasFormErrors}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-sm"
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
