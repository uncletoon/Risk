import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Save, CheckCircle2 } from 'lucide-react';

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
        const currentOrg = orgs.find(o => o.id === user?.organization_id) || orgs[0];
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
      
      const updated = await api.updateOrganization(org.id, {
        name,
        industry,
        description,
        contact_email: contactEmail,
      });

      setOrg(updated);
      setSuccessMsg('Organization profile updated and renamed successfully.');
      
      const savedUser = localStorage.getItem('eridss_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        u.organization_name = updated.name;
        localStorage.setItem('eridss_user', JSON.stringify(u));
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error updating organization profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-bold text-primary">
        Loading organization profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary">Enterprise Organization Profile</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
              Manage your business profile details used by Gemini AI during document extraction and risk contextualization.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold flex items-center gap-2 border border-tertiary-fixed-dim/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
            Organization Legal / Trade Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. RWANDA KABUHARIWE"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
              Industry Sector
            </label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Financial & Enterprise Services"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
              Risk & Compliance Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. risk@enterprise.rw"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
            Operational Scope & Business Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe lines of business, digital infrastructure, operational models, and key risk boundaries..."
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-outline-variant">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Profile...' : 'Save Organization Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
