import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  History,
  TrendingDown,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function AssessmentHistory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const metrics = await api.getDashboard();
      setData(metrics);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const historyTrend = (data?.historyTrend || []).map((h: any, idx: number) => ({
    version: h.version_label || `v${idx + 1}.0`,
    eri: Number(h.overall_eri),
    classification: h.eri_classification,
    date: new Date(h.snapshot_date).toLocaleDateString(),
  }));

  const getEriBadgeBg = (classification?: string) => {
    switch (classification) {
      case 'Very Low':
      case 'Low':
        return 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-fixed-dim/30';
      case 'Moderate':
        return 'bg-secondary/15 text-secondary border-secondary/30';
      case 'High':
      case 'Critical':
      default:
        return 'bg-error-container text-on-error-container border-error/30';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Longitudinal Risk Assessment History</h1>
            <p className="text-xs text-on-surface-variant">
              Track multi-period enterprise risk trajectory and evaluate whether management mitigations are lowering exposure.
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Trend Chart */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-primary">Enterprise Risk Index (ERI) Progression</h2>
          <p className="text-xs text-on-surface-variant">
            Historical progression of the normalized ERI (0 to 100).
          </p>
        </div>

        <div className="h-[280px] w-full">
          {historyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e6" />
                <XAxis dataKey="version" tick={{ fill: '#44474c', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#44474c', fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  name="Enterprise Risk Index"
                  dataKey="eri"
                  stroke="#815600"
                  strokeWidth={3}
                  dot={{ fill: '#ffb22c', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-on-surface-variant">
              Historical snapshots will populate after assessments are completed.
            </div>
          )}
        </div>
      </div>

      {/* Snapshot Log Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant">
          <h3 className="text-sm font-bold text-primary">Historical Assessment Snapshots</h3>
        </div>

        {historyTrend.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant">
            No historical snapshots recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-6 font-bold">Snapshot Version</th>
                  <th className="py-3 px-4 font-bold">Date Taken</th>
                  <th className="py-3 px-4 font-bold">Calculated ERI</th>
                  <th className="py-3 px-4 font-bold">Classification</th>
                  <th className="py-3 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data?.historyTrend.map((snap: any, idx: number) => (
                  <tr key={snap.id} className="hover:bg-surface-container-low">
                    <td className="py-3.5 px-6 font-bold text-primary">
                      {snap.version_label || `v${idx + 1}.0`}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {new Date(snap.snapshot_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-primary">
                      {Number(snap.overall_eri).toFixed(1)} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEriBadgeBg(snap.eri_classification)}`}>
                        {snap.eri_classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/assessments/${snap.assessment_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
                      >
                        <span>Open Assessment</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
