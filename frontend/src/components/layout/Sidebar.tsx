import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FilePlus2,
  FileSpreadsheet,
  ShieldAlert,
  History,
  FileText,
  Users,
  Sliders,
  Scale,
  Activity,
  HeartPulse,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const { user, isSystemAdmin, logout } = useAuth();

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-5 bg-primary-container w-[280px] z-30 shadow-2xl border-r border-outline-variant/10 text-on-primary">
      {/* Brand Header */}
      <div className="px-6 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0 shadow-md">
          <ShieldAlert className="w-6 h-6 text-on-secondary-container" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide leading-tight text-surface-container-lowest">ERIDSS</h1>
          <p className="text-[10px] text-on-primary-container font-semibold tracking-wider uppercase">
            Risk Intelligence & Decision Support
          </p>
        </div>
      </div>

      {/* Role Context Badge */}
      <div className="mx-4 mb-4 px-3.5 py-2.5 rounded-xl bg-surface-container-highest/10 border border-outline-variant/20 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">Active Role</p>
          <p className="text-[12px] font-semibold text-surface-container-lowest truncate">
            {isSystemAdmin ? 'System Administrator' : 'Chief Risk Officer'}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1.5 custom-scrollbar">
        {/* Core Navigation */}
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container/80 mt-1 mb-1">
          Risk Management
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Executive Dashboard</span>
        </NavLink>

        {!isSystemAdmin && (
          <>
            <NavLink
              to="/organization"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              <span>Organization Profile</span>
            </NavLink>

            <NavLink
              to="/assessments/new"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <FilePlus2 className="w-4 h-4" />
              <span>New Assessment (1-Doc)</span>
            </NavLink>

            <NavLink
              to="/assessments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Assessments Repository</span>
            </NavLink>

            <NavLink
              to="/mitigations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mitigation Actions</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <History className="w-4 h-4" />
              <span>Longitudinal Trends</span>
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>Audit-Ready Reports</span>
            </NavLink>
          </>
        )}

        {/* Admin Governance Section */}
        {isSystemAdmin && (
          <>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container/80 mt-3 mb-1">
              System Governance
            </p>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <Sliders className="w-4 h-4" />
              <span>Risk Categories & Weights</span>
            </NavLink>

            <NavLink
              to="/admin/rules"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <Scale className="w-4 h-4" />
              <span>Deterministic Rules Engine</span>
            </NavLink>

            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <Activity className="w-4 h-4" />
              <span>System Audit Logs</span>
            </NavLink>

            <NavLink
              to="/admin/health"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-secondary-container bg-surface-container-highest/20 font-bold shadow-xs'
                    : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                }`
              }
            >
              <HeartPulse className="w-4 h-4" />
              <span>Database & System Health</span>
            </NavLink>
          </>
        )}
      </div>

      {/* User Profile & Logout Footer */}
      <div className="px-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-surface-container-lowest truncate">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-on-primary-container truncate">{user?.department || 'Risk Governance'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-on-primary-container hover:text-error-container hover:bg-error/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
