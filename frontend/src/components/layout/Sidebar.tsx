import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-6 bg-primary-container docked w-[280px] z-20 shadow-xl border-r border-white/5">
      {/* Brand Header */}
      <div className="px-6 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-md">
          <span className="text-on-secondary font-bold text-lg">E</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-on-primary tracking-wide leading-tight">ERIDSS</h1>
          <p className="text-[11px] text-on-primary-container font-semibold tracking-wider uppercase">Sager Ganza</p>
        </div>
      </div>

      {/* Role Context Chip */}
      <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">Active Portal</p>
          <p className="text-[12px] font-semibold text-on-primary truncate capitalize">
            {role === 'employee' ? 'Loan Officer Portal' : role === 'risk_officer' ? 'Risk Officer Desk' : 'Executive Admin Portal'}
          </p>
        </div>
      </div>
      
      {/* Role-Specific Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1.5">
        
        {/* ================= 1. EMPLOYEE NAVIGATION ================= */}
        {role === 'employee' && (
          <>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container/70 mb-1">
              Intake & Reporting
            </p>

            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>My Reports & Feedback</span>
            </NavLink>

            <NavLink 
              to="/submissions/new" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>Submit Risk Evidence</span>
            </NavLink>

            <NavLink 
              to="/employee/profile" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>My Profile</span>
            </NavLink>
          </>
        )}

        {/* ================= 2. RISK OFFICER NAVIGATION ================= */}
        {role === 'risk_officer' && (
          <>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container/70 mb-1">
              Risk Decisioning
            </p>

            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Decision Desk & Overview</span>
            </NavLink>

            <NavLink 
              to="/officer/reviews" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span>Underwriting Queue & Rules</span>
            </NavLink>

            <NavLink 
              to="/risks" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span>Risk Registry (Rwf)</span>
            </NavLink>
          </>
        )}

        {/* ================= 3. SYSTEM ADMIN NAVIGATION ================= */}
        {role === 'admin' && (
          <>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container/70 mb-1">
              Executive Administration
            </p>

            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              <span>Executive Dashboard</span>
            </NavLink>

            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>User Accounts</span>
            </NavLink>

            <NavLink 
              to="/admin/health" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
              <span>Database & System Health</span>
            </NavLink>

            <NavLink 
              to="/risks" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-xs' 
                    : 'text-on-primary-container hover:text-on-primary hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span>Risk Registry (Rwf)</span>
            </NavLink>
          </>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="px-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-on-primary font-bold text-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-primary truncate">{user?.full_name || 'Logged User'}</p>
            <p className="text-[10px] text-on-primary-container truncate">{user?.department || 'Sager Ganza'}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
