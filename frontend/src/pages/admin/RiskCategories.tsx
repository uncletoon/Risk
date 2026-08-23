import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Sliders, Save, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function RiskCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (code: string, newWeight: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.code === code ? { ...c, default_weight: newWeight } : c))
    );
  };

  const handleSaveWeights = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      for (const cat of categories) {
        await api.updateAdminCategoryWeight(cat.code, Number(cat.default_weight));
      }
      setSuccessMsg('Risk category weights updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchCategories();
    } catch (err: any) {
      alert(`Failed to update category weights: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = categories.reduce((sum, c) => sum + (Number(c.default_weight) || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              System Administration
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary">Risk Categories & Weighting Engine</h1>
          <p className="text-xs text-on-surface-variant">
            Configure the 6 core enterprise risk categories and their mathematical weights for Enterprise Risk Index (ERI) calculation.
          </p>
        </div>

        <button
          onClick={handleSaveWeights}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Category Weights'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-semibold flex items-center gap-2 border border-tertiary-fixed-dim/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Weight Balance Card */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-on-surface">Total Category Weight Allocation:</span>
          <p className="text-[11px] text-on-surface-variant">Default baseline requires total sum to equal 100%.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-extrabold ${Math.abs(totalWeight - 100) < 0.1 ? 'text-on-tertiary-container' : 'text-error'}`}>
            {totalWeight.toFixed(1)}%
          </span>
          {Math.abs(totalWeight - 100) < 0.1 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tertiary-container/20 text-on-tertiary-container">
              Balanced (100%)
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error-container text-on-error-container">
              Unbalanced
            </span>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-on-surface-variant">Loading categories...</div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {categories.map((cat) => (
              <div key={cat.id} className="p-6 hover:bg-surface-container-low transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-container text-secondary">
                        {cat.code}
                      </span>
                      <h3 className="text-sm font-bold text-primary">{cat.name}</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant">{cat.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="text-xs font-bold text-on-surface">Weight (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={cat.default_weight}
                      onChange={(e) => handleWeightChange(cat.code, parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold text-primary text-right focus:outline-none focus:ring-2 focus:ring-primary"
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
