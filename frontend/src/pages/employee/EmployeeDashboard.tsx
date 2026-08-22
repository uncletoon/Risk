import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface EmployeeSubmission {
  id: number;
  title: string;
  category: string;
  description: string;
  filename: string;
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'ARCHIVED';
  ai_prediction?: any;
  decision_notes?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<EmployeeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/risk/employee-submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching employee submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'PENDING_REVIEW').length;
  const confirmedCount = submissions.filter(s => s.status === 'CONFIRMED').length;
  const rejectedCount = submissions.filter(s => s.status === 'REJECTED').length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Frontline Header Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Loan Officer Intake Portal
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-tertiary-container/10 text-on-tertiary-container border border-tertiary-fixed-dim/30">
              Frontline Operations
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Welcome, <strong className="text-on-surface">{user?.full_name}</strong> ({user?.department}). Document and track loan activity evidence.
          </p>
        </div>

        <Link
          to="/submissions/new"
          className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Submit New Risk Evidence
        </Link>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">My Total Reports</span>
            <div className="text-3xl font-extrabold text-on-surface mt-1">{submissions.length}</div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Recorded in PostgreSQL</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">assignment</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Under Review</span>
            <div className="text-3xl font-extrabold text-secondary mt-1">{pendingCount}</div>
            <p className="text-[11px] text-secondary font-medium mt-0.5">Awaiting Risk Officer decision</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Officer Decisions</span>
            <div className="text-3xl font-extrabold text-on-tertiary-container mt-1">{confirmedCount + rejectedCount}</div>
            <p className="text-[11px] text-on-tertiary-container font-medium mt-0.5">{confirmedCount} Confirmed • {rejectedCount} Rejected</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 text-on-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
        </div>
      </div>

      {/* Main Content: My Reported Issues & Expert Feedback from Database */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs flex flex-col">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
          <div>
            <h3 className="text-base font-bold text-on-surface">My Reported Issues & Risk Officer Feedback</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live updates directly from the Risk Department in PostgreSQL.
            </p>
          </div>
          <button
            onClick={fetchMySubmissions}
            className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading your reported records from database...</div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {submissions.map((sub) => {
              const pred = typeof sub.ai_prediction === 'string' ? JSON.parse(sub.ai_prediction) : sub.ai_prediction;

              // Parse structured decision notes if available
              let parsedNotes: { officer_notes?: string; selected_recommendations?: string[] } = {};
              if (sub.decision_notes) {
                try {
                  parsedNotes = JSON.parse(sub.decision_notes);
                } catch {
                  parsedNotes = { officer_notes: sub.decision_notes };
                }
              }

              return (
                <div key={sub.id} className="p-5 hover:bg-surface-container-low transition-colors flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                          {sub.category}
                        </span>
                        <h4 className="text-sm font-bold text-on-surface">{sub.title}</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Reported on {new Date(sub.created_at).toLocaleDateString()} • Attached Evidence: <code className="bg-surface-container px-1 py-0.2 rounded font-data-mono">{sub.filename}</code>
                      </p>
                    </div>

                    <div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                          sub.status === 'CONFIRMED'
                            ? 'bg-tertiary-fixed-dim/30 text-on-tertiary-container border border-tertiary-container/30'
                            : sub.status === 'REJECTED'
                            ? 'bg-error-container text-on-error-container border border-error/30'
                            : sub.status === 'ARCHIVED'
                            ? 'bg-surface-container-high text-on-surface-variant'
                            : 'bg-secondary-container/30 text-secondary border border-secondary/30'
                        }`}
                      >
                        {sub.status === 'CONFIRMED'
                          ? 'Confirmed by Officer'
                          : sub.status === 'REJECTED'
                          ? 'Rejected'
                          : sub.status === 'ARCHIVED'
                          ? 'Archived'
                          : 'Pending Expert Review'}
                      </span>
                    </div>
                  </div>

                  {/* My Stated Rationale */}
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 text-xs">
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-0.5">My Observation & Rationale:</span>
                    <p className="text-on-surface italic">"{sub.description}"</p>
                  </div>

                  {/* Risk Officer Feedback & Directives */}
                  {sub.status !== 'PENDING_REVIEW' && (
                    <div className="p-4 rounded-xl bg-surface-bright border border-secondary/30 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                        <span className="font-bold text-primary flex items-center gap-1.5 text-xs">
                          <span className="material-symbols-outlined text-[18px] text-secondary">psychology</span>
                          Official Risk Officer Directives & Decisions:
                        </span>
                        {pred?.eri_score && (
                          <span className="font-bold text-secondary font-data-mono">
                            ERI Risk Score: {pred.eri_score}/100 ({pred.risk_level} Risk)
                          </span>
                        )}
                      </div>

                      {/* 1. Custom Professional Directives Written by Risk Officer */}
                      {parsedNotes.officer_notes && (
                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border-2 border-secondary/30 text-xs text-on-surface">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2">
                            <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                            Direct Instructions from Risk Officer ({sub.decided_by || 'Risk Dept'}):
                          </span>
                          
                          <div className="space-y-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/60">
                            {parsedNotes.officer_notes.split('\n').map((line, idx) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              return (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                    {idx + 1}
                                  </span>
                                  <p className="text-on-surface font-bold leading-relaxed text-xs">
                                    {trimmed.replace(/^\d+[\.\)]\s*/, '')}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. Selected AI Checklist Directives Approved by Risk Officer */}
                      {parsedNotes.selected_recommendations && parsedNotes.selected_recommendations.length > 0 && (
                        <div className="pt-1">
                          <p className="font-semibold text-on-surface mb-1.5 text-[11px] uppercase tracking-wider text-on-surface-variant">
                            Approved Policy Action Items to Follow:
                          </p>
                          <ul className="space-y-1.5">
                            {parsedNotes.selected_recommendations.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/40 text-on-surface text-xs">
                                <span className="material-symbols-outlined text-[16px] text-tertiary-container shrink-0 mt-0.5">check_circle</span>
                                <span className="font-medium">{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="text-[10px] text-on-surface-variant pt-1">
                        Reviewed & Dispatched by <strong>{sub.decided_by || 'Risk Officer'}</strong> on {sub.decided_at ? new Date(sub.decided_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {submissions.length === 0 && (
              <div className="p-12 text-center text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] text-outline-variant mb-2 block">
                  assignment_turned_in
                </span>
                You have not submitted any risk reports yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
