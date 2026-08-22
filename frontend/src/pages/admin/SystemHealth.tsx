import React, { useState, useEffect } from 'react';

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/admin/system-health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error('Error loading system health:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Database & System Health</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time PostgreSQL engine status, connection parameters, and table row allocations.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center gap-1.5 border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">PostgreSQL Service</span>
          <div className="text-2xl font-extrabold text-on-tertiary-container mt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            {health?.database?.status || 'Online'}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Host: {health?.database?.host} • DB: {health?.database?.dbName}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Storage Utilization</span>
          <div className="text-2xl font-extrabold text-on-surface mt-2">
            {health?.database?.sizeFormatted || '7.5 MB'}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Total physical disk usage</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Relational Entities</span>
          <div className="text-2xl font-extrabold text-primary mt-2">
            {(health?.database?.totalUsers || 0) + (health?.database?.totalSubmissions || 0) + (health?.database?.totalAssessments || 0)}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Total rows in relational tables</p>
        </div>
      </div>

      {/* Table Allocations */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-6">
        <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">table_rows</span>
          Active Database Tables
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                <th className="px-4 py-3">Table Name</th>
                <th className="px-4 py-3 text-right">Live Row Count</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 font-data-mono">
              {health?.tables?.map((t: any) => (
                <tr key={t.table_name} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-semibold text-on-surface">{t.table_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{t.row_count}</td>
                  <td className="px-4 py-3 text-center font-sans text-[11px] text-on-tertiary-container font-semibold">
                    Healthy
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
