import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Assessment } from '../lib/api';
import {
  FileSpreadsheet,
  FilePlus2,
  ChevronRight,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function AssessmentList() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-fixed-dim/40';
      case 'FAILED':
        return 'bg-error-container text-on-error-container border-error/30';
      default:
        return 'bg-secondary-container/20 text-secondary border-secondary-container/40 animate-pulse';
    }
  };

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Enterprise Risk Governance
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary">Assessments Repository</h1>
          <p className="text-xs text-on-surface-variant">
            Historical and active single-document enterprise risk assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAssessments}
            className="p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/assessments/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>New Assessment</span>
          </Link>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-on-surface-variant">
            Loading assessment repository...
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-outline opacity-50" />
            <p className="text-sm font-bold text-primary">No risk assessments found</p>
            <p className="text-xs text-on-surface-variant">
              Upload a business document to initiate your organization's first assessment.
            </p>
            <Link
              to="/assessments/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold mt-2"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Create New Assessment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/60 bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3.5 px-6 font-bold">Assessment / Organization</th>
                  <th className="py-3.5 px-4 font-bold">Single Document</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Calculated ERI</th>
                  <th className="py-3.5 px-4 font-bold">Classification</th>
                  <th className="py-3.5 px-4 font-bold">Created Date</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-primary text-sm">{a.title}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{a.org_name || 'Enterprise'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-on-surface">
                      <div className="truncate max-w-[180px]" title={a.document_name || 'No document'}>
                        {a.document_name || 'Pending Upload'}
                      </div>
                      {a.file_size && (
                        <span className="text-[10px] text-on-surface-variant">
                          {(a.file_size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-primary text-sm">
                      {a.overall_eri !== undefined && a.overall_eri !== null ? Number(a.overall_eri).toFixed(1) : '--'}
                      <span className="text-[10px] font-normal text-on-surface-variant"> / 100</span>
                    </td>

                    <td className="py-4 px-4">
                      {a.eri_classification ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEriBadgeBg(a.eri_classification)}`}>
                          {a.eri_classification}
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant">--</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/assessments/${a.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                        >
                          <span>Open Desk</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        {a.status === 'COMPLETED' && (
                          <Link
                            to={`/reports?assessmentId=${a.id}`}
                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors"
                            title="View Formal Report"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
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
