import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Sliders, Save, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export default function RiskCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setErrorMsg(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (code: string, newWeight: number) => {
    setErrorMsg(null);
    setCategories((prev) =>
      prev.map((c) => (c.code === code ? { ...c, default_weight: newWeight } : c))
    );
  };

  const handleEqualDistribution = () => {
    setErrorMsg(null);
    if (categories.length === 0) return;
    const count = categories.length;
    const baseWeight = Math.floor((100 / count) * 100) / 100;
    const remainder = Number((100 - baseWeight * count).toFixed(2));

    setCategories((prev) =>
      prev.map((c, idx) => ({
        ...c,
        default_weight: idx === 0 ? Number((baseWeight + remainder).toFixed(2)) : baseWeight,
      }))
    );
  };

  const totalWeight = categories.reduce((sum, c) => sum + (Number(c.default_weight) || 0), 0);
  const isBalanced = Math.abs(totalWeight - 100) < 0.05;

  const handleSaveWeights = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      if (!isBalanced) {
        throw new Error(
          `Total category weights must sum to exactly 100.0% before saving (Current sum: ${totalWeight.toFixed(2)}%).`
        );
      }

      const payload = categories.map((c) => ({
        code: c.code,
        defaultWeight: Number(c.default_weight),
      }));

      await api.updateAdminCategoryWeightsBatch(payload);
      setSuccessMsg('Risk category weights updated and verified successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update category weights');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-secondary" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              System Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Risk Categories & Weighting Engine</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
            Configure the core enterprise risk categories and their mathematical weights for Enterprise Risk Index (ERI) calculation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleEqualDistribution}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all cursor-pointer border border-outline-variant"
            title="Automatically distribute 100% equally across all active categories"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Equalize (100%)</span>
          </button>

          <button
            onClick={handleSaveWeights}
            disabled={saving || !isBalanced}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isBalanced
                ? 'bg-primary text-on-primary hover:bg-primary/90'
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Validating & Saving...' : 'Save Category Weights'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold flex items-center gap-2 border border-tertiary-fixed-dim/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2 border border-error/40">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Weight Balance Card */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-xs font-black text-primary uppercase tracking-wider">Total Category Weight Allocation</span>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Mathematical baseline requires the sum of all active category weights to equal exactly 100.0%.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black ${isBalanced ? 'text-on-tertiary-container' : 'text-error'}`}>
            {totalWeight.toFixed(2)}%
          </span>
          {isBalanced ? (
            <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-tertiary-container/20 text-on-tertiary-container border border-tertiary-fixed-dim/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Balanced (100%)</span>
            </span>
          ) : (
            <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-error-container text-on-error-container border border-error/40 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unbalanced (Delta: {(100 - totalWeight).toFixed(2)}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-primary">Loading categories...</div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {categories.map((cat) => (
              <div key={cat.id} className="p-5 sm:p-6 hover:bg-surface-container-low transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-surface-container text-secondary border border-outline-variant">
                        {cat.code}
                      </span>
                      <h3 className="text-sm font-bold text-primary">{cat.name}</h3>
                    </div>
                    <p className="text-xs text-on-surface font-medium">{cat.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                    <label className="text-xs font-bold text-primary">Weight (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={cat.default_weight}
                      onChange={(e) => handleWeightChange(cat.code, parseFloat(e.target.value) || 0)}
                      className="w-28 px-3.5 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-black text-primary text-right focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
