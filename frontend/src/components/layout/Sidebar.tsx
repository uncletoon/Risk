import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
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
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const { user, isSystemAdmin } = useAuth();
  const [orgName, setOrgName] = useState(user?.organization_name || 'RWANDA KABUHARIWE');
  const [orgIndustry, setOrgIndustry] = useState('Financial & Enterprise Services');

  useEffect(() => {
    // Fetch active organization details to show at the bottom
    const loadOrg = async () => {
      try {
        const orgs = await api.getOrganizations();
        if (orgs.length > 0) {
          const matched = orgs.find(o => o.id === user?.organization_id) || orgs[0];
          setOrgName(matched.name);
          setOrgIndustry(matched.industry || 'Financial & Enterprise Services');
        }
      } catch (err) {
        // fallback to user data
      }
    };
    loadOrg();
  }, [user]);

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
              end
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

      {/* Bottom Organization Profile Link */}
      <div className="px-3 pt-3 border-t border-outline-variant/20">
        <NavLink
          to="/organization"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
            }`
          }
        >
          <div className="w-9 h-9 rounded-xl bg-surface-container-highest/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-surface-container-lowest truncate leading-tight" title={orgName}>
              {orgName}
            </p>
            <p className="text-[10px] text-on-primary-container truncate mt-0.5" title={orgIndustry}>
              {orgIndustry}
            </p>
          </div>
        </NavLink>
      </div>
    </nav>
  );
}
