import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Activity, Clock, ShieldCheck, User, Search } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              System Administration
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary">System Audit Trail</h1>
          <p className="text-xs text-on-surface-variant">
            Immutable log of user logins, assessments, document uploads, scoring events, and governance changes.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-outline pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit actions..."
            className="w-full pl-9 pr-3.5 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-on-surface-variant">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">No audit logs matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-6 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">Target Entity</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">IP Address</th>
                  <th className="py-3 px-6 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low">
                    <td className="py-3.5 px-6 font-bold text-primary font-mono text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      {log.user_name || 'System'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      {log.entity_type} #{log.entity_id || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-6 text-on-surface-variant max-w-[220px] truncate text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
