import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Building2, User } from 'lucide-react';

export default function TopNavbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role?: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'RISK_OFFICER' || r === 'OFFICER' || r === 'EMPLOYEE') {
      return {
        label: 'Risk Officer',
        bg: 'bg-secondary/15 text-secondary border-secondary/30',
      };
    }
    if (r === 'SYSTEM_ADMIN' || r === 'ADMIN') {
      return {
        label: 'System Admin',
        bg: 'bg-primary-container/10 text-primary border-primary-container/30',
      };
    }
    return {
      label: 'Risk Officer',
      bg: 'bg-secondary/15 text-secondary border-secondary/30',
    };
  };

  const roleInfo = getRoleBadge(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-surface-bright border-b border-outline-variant shadow-xs sticky top-0 z-20 w-full">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-primary tracking-tight">
          {title}
        </h2>
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.bg}`}
        >
          {roleInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-3 border-l border-outline-variant hover:opacity-85 transition-opacity text-left cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5 truncate max-w-[180px]">
                {user?.organization_name || user?.department || 'Enterprise Risk'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full border border-outline-variant bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold shadow-xs">
              {getInitials(user?.full_name)}
            </div>
            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
          </button>

          {/* User Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-outline-variant/60 bg-surface-container-low">
                <p className="text-xs font-bold text-on-surface">
                  {user?.full_name}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {user?.email}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-1.5 ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
              </div>

              {/* Log Out Option */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
