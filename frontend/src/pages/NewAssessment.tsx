import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  FilePlus2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Building2,
} from 'lucide-react';

export default function NewAssessment() {
  const { user, isSystemAdmin } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(user?.organization_id || 0);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, [user]);

  const fetchOrgs = async () => {
    try {
      const orgs = await api.getOrganizations();
      setOrganizations(orgs);
      if (user?.organization_id && orgs.some(o => o.id === user.organization_id)) {
        setSelectedOrgId(user.organization_id);
      } else if (orgs.length > 0) {
        setSelectedOrgId(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setError(null);
    const ext = '.' + uploadedFile.name.split('.').pop()?.toLowerCase();
    const allowed = ['.pdf', '.docx', '.xlsx', '.xls', '.csv'];

    if (!allowed.includes(ext)) {
      setError(`Invalid format: ${ext}. Only PDF, DOCX, XLSX, and CSV business documents are supported.`);
      setFile(null);
      return;
    }

    if (uploadedFile.size > 25 * 1024 * 1024) {
      setError('File exceeds maximum size limit of 25MB.');
      setFile(null);
      return;
    }

    setFile(uploadedFile);
    if (!title) {
      const baseName = uploadedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(`Enterprise Assessment - ${baseName}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please attach exactly one business document before starting the assessment.');
      return;
    }

    const orgId = isSystemAdmin ? selectedOrgId : (user?.organization_id || selectedOrgId);
    if (!orgId) {
      setError('No organization profile found for this account.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setStatusMessage('Creating assessment session in database...');
      const assessment = await api.createAssessment({
        organizationId: orgId,
        title: title || 'Comprehensive Enterprise Risk Assessment',
      });

      setStatusMessage('Uploading and validating document metadata...');
      await api.uploadDocument(assessment.id, file);

      setStatusMessage('Executing Gemini extraction and deterministic risk scoring...');
      api.processAssessment(assessment.id).catch(err => {
        console.warn('Background pipeline error (will be reflected in assessment state):', err);
      });

      navigate(`/assessments/${assessment.id}`);
    } catch (err: any) {
      console.error('Assessment submission error:', err);
      setError(err.message || 'Failed to initialize assessment');
      setLoading(false);
    }
  };

  const activeOrg = organizations.find(o => o.id === selectedOrgId) || organizations[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary">New Enterprise Risk Assessment</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
              Upload exactly ONE comprehensive business document (PDF, DOCX, XLSX, CSV) to analyze organizational risk.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Single Document Rule Notice */}
      <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary-container/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-on-surface leading-relaxed">
          <p className="font-extrabold text-secondary">Strict Single-Document Architecture</p>
          <p className="text-on-surface font-medium mt-0.5">
            The assessment accepts <strong>exactly ONE uploaded document</strong> containing financial, operational, strategic, legal/regulatory, or market data. Gemini AI will autonomously extract facts and evidence without forcing manual questionnaires.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2 border border-error/40">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
              Organization
            </label>
            {isSystemAdmin && organizations.length > 1 ? (
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.industry})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary">
                <Building2 className="w-4 h-4 text-secondary shrink-0" />
                <span className="truncate">
                  {user?.organization_name || activeOrg?.name || 'Enterprise'} {activeOrg?.industry ? `(${activeOrg.industry})` : ''}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
              Assessment Title / Scope
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 Comprehensive Enterprise Risk Review"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
            Attach Single Assessment Document
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 ${
              dragActive
                ? 'border-primary bg-primary/5'
                : file
                ? 'border-tertiary-fixed-dim/60 bg-tertiary-container/10'
                : 'border-outline-variant hover:border-primary/50 bg-surface-container-low'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 text-on-tertiary-container flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-extrabold text-primary">{file.name}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
                </p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-3 text-xs font-bold text-secondary hover:underline cursor-pointer"
                >
                  Change Attached Document
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-extrabold text-primary">
                  Drag and drop your enterprise business document here
                </p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Supported formats: PDF, DOCX, XLSX, CSV (Max 25MB)
                </p>
                <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-xs font-bold text-primary cursor-pointer transition-colors">
                  <span>Browse File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant font-semibold text-center sm:text-left">
            {statusMessage || 'Click execute to trigger autonomous Gemini fact extraction & calculations.'}
          </p>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <span>Execute Risk Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
