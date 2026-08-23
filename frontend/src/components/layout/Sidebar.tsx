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
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isSystemAdmin } = useAuth();
  const [orgName, setOrgName] = useState(user?.organization_name || 'RWANDA KABUHARIWE');
  const [orgIndustry, setOrgIndustry] = useState('Financial & Enterprise Services');

  useEffect(() => {
    const loadOrg = async () => {
      try {
        const orgs = await api.getOrganizations();
        if (orgs.length > 0) {
          const matched = orgs.find(o => o.id === user?.organization_id) || orgs[0];
          setOrgName(matched.name);
          setOrgIndustry(matched.industry || 'Financial & Enterprise Services');
        }
      } catch (err) {
        // fallback
      }
    };
    loadOrg();
  }, [user]);

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-full flex flex-col py-5 bg-primary-container w-[280px] z-40 shadow-2xl border-r border-outline-variant/10 text-on-primary transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6 text-on-secondary-container" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide leading-tight text-surface-container-lowest">ERIDSS</h1>
              <p className="text-[10px] text-on-primary-container font-semibold tracking-wider uppercase">
                Risk Intelligence & Decision
              </p>
            </div>
          </div>

          {/* Close button on small screens */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-on-primary-container hover:text-white rounded-lg cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Context Badge */}
        <div className="mx-4 mb-4 px-3.5 py-2.5 rounded-xl bg-surface-container-highest/15 border border-outline-variant/30 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">Active Role</p>
            <p className="text-[12px] font-bold text-surface-container-lowest truncate">
              {isSystemAdmin ? 'System Administrator' : 'Chief Risk Officer'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1.5 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container mt-1 mb-1">
            Risk Management
          </p>

          <NavLink
            to="/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                  : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
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
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <FilePlus2 className="w-4 h-4" />
                <span>New Assessment (1-Doc)</span>
              </NavLink>

              <NavLink
                to="/assessments"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Assessments Repository</span>
              </NavLink>

              <NavLink
                to="/mitigations"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mitigation Actions</span>
              </NavLink>

              <NavLink
                to="/history"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <History className="w-4 h-4" />
                <span>Longitudinal Trends</span>
              </NavLink>

              <NavLink
                to="/reports"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
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
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-on-primary-container mt-3 mb-1">
                System Governance
              </p>

              <NavLink
                to="/admin/users"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>User Accounts</span>
              </NavLink>

              <NavLink
                to="/admin/categories"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <Sliders className="w-4 h-4" />
                <span>Risk Categories & Weights</span>
              </NavLink>

              <NavLink
                to="/admin/rules"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <Scale className="w-4 h-4" />
                <span>Deterministic Rules Engine</span>
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
                  }`
                }
              >
                <Activity className="w-4 h-4" />
                <span>System Audit Logs</span>
              </NavLink>

              <NavLink
                to="/admin/health"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-secondary-container bg-surface-container-highest/25 font-bold shadow-xs'
                      : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
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
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-secondary-container bg-surface-container-highest/30 font-bold shadow-xs'
                  : 'text-on-primary-container hover:text-surface-container-lowest hover:bg-surface-container-highest/15'
              }`
            }
          >
            <div className="w-9 h-9 rounded-xl bg-surface-container-highest/25 text-secondary-container flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-surface-container-lowest truncate leading-tight" title={orgName}>
                {orgName}
              </p>
              <p className="text-[10px] text-on-primary-container font-medium truncate mt-0.5" title={orgIndustry}>
                {orgIndustry}
              </p>
            </div>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
