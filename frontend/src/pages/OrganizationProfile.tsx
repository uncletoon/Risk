import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Save, CheckCircle2, ShieldCheck, Mail, Globe, Layers } from 'lucide-react';

export default function OrganizationProfile() {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    fetchOrg();
  }, []);

  const fetchOrg = async () => {
    try {
      setLoading(true);
      const orgs = await api.getOrganizations();
      if (orgs.length > 0) {
        const currentOrg = orgs[0];
        setOrg(currentOrg);
        setName(currentOrg.name);
        setIndustry(currentOrg.industry || 'Financial & Enterprise Services');
        setDescription(currentOrg.description || '');
        setContactEmail(currentOrg.contact_email || '');
      }
    } catch (err) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    try {
      setSaving(true);
      setSuccessMsg(null);
      const updated = await api.createOrganization({
        name,
        industry,
        description,
        contact_email: contactEmail,
      });
      setOrg(updated);
      setSuccessMsg('Organization profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-on-surface-variant font-semibold">
        Loading organization profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Enterprise Profile & Scope</h1>
            <p className="text-xs text-on-surface-variant">
              Manage organization parameters used by Gemini AI during document extraction and risk contextualization.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-semibold flex items-center gap-2 border border-tertiary-fixed-dim/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
            Organization Legal Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Industry Sector
            </label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Risk & Compliance Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
            Operational Scope & Business Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe lines of business, digital infrastructure, regulatory boundaries, and key customer segments..."
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-outline-variant/60">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Organization Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
