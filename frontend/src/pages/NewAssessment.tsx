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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(user?.organization_id || 1);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

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

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Assessment Container
      setStatusMessage('Creating assessment session in database...');
      const assessment = await api.createAssessment({
        organizationId: selectedOrgId || 1,
        title: title || 'Comprehensive Enterprise Risk Assessment',
      });

      // Step 2: Upload Single Document
      setStatusMessage('Uploading and validating document metadata...');
      await api.uploadDocument(assessment.id, file);

      // Step 3: Trigger Processing Pipeline in background
      setStatusMessage('Executing Gemini extraction and deterministic risk scoring...');
      api.processAssessment(assessment.id).catch(err => {
        console.warn('Background pipeline error (will be reflected in assessment state):', err);
      });

      // Redirect immediately to Assessment Details tracker
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
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">New Enterprise Risk Assessment</h1>
            <p className="text-xs text-on-surface-variant">
              Upload exactly ONE comprehensive business document (PDF, DOCX, XLSX, CSV) to analyze organizational risk.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Single Document Rule Notice */}
      <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary-container/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs text-on-surface leading-relaxed">
          <p className="font-bold text-secondary">Strict Single-Document Architecture</p>
          <p className="text-on-surface-variant mt-0.5">
            The assessment accepts <strong>exactly ONE uploaded document</strong> containing financial, operational, technological, strategic, or compliance data. Gemini AI will autonomously extract facts and evidence without forcing manual questionnaires.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2 border border-error/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Organization
            </label>
            {organizations.length > 1 ? (
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.industry})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary">
                <Building2 className="w-4 h-4 text-secondary" />
                <span>{activeOrg?.name || 'RWANDA KABUHARIWE'} ({activeOrg?.industry || 'Financial & Enterprise Services'})</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Assessment Title / Scope
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FY2026 Comprehensive Enterprise Risk Audit"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
            Attach Single Enterprise Document (PDF, DOCX, XLSX, CSV)
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-secondary bg-secondary-container/10'
                : file
                ? 'border-tertiary-fixed-dim/60 bg-tertiary-container/10'
                : 'border-outline-variant hover:border-outline bg-surface-container-low'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-on-tertiary-container flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 text-xs font-bold text-error hover:underline cursor-pointer"
                >
                  Choose a different document
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">
                    Drag and drop your single enterprise document here
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Supports PDF, DOCX, XLSX, and CSV (Up to 25MB)
                  </p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors cursor-pointer inline-block">
                  <span>Browse Document</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-outline-variant/50">
          <button
            type="submit"
            disabled={loading || !file}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-40 shadow-sm transition-all cursor-pointer"
          >
            {loading ? (
              <span>{statusMessage || 'Processing Assessment...'}</span>
            ) : (
              <>
                <span>Launch Risk Assessment Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
