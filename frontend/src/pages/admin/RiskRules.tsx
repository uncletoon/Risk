import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Scale, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RiskRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [categoryCode, setCategoryCode] = useState('FINANCIAL');
  const [factorName, setFactorName] = useState('');
  const [conditionOperator, setConditionOperator] = useState('GT');
  const [thresholdValue, setThresholdValue] = useState('');
  const [likelihoodScore, setLikelihoodScore] = useState(4);
  const [impactScore, setImpactScore] = useState(4);
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminRules();
      setRules(data);
    } catch (err: any) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      await api.createAdminRule({
        categoryCode,
        factorName,
        conditionOperator,
        thresholdValue,
        likelihoodScore: Number(likelihoodScore),
        impactScore: Number(impactScore),
        severity,
        description,
      });
      setIsModalOpen(false);
      setFactorName('');
      setThresholdValue('');
      setDescription('');
      setSuccessMsg(`Rule for '${factorName}' created successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchRules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!window.confirm('Are you sure you want to delete this deterministic rule?')) return;
    try {
      await api.deleteAdminRule(ruleId);
      fetchRules();
    } catch (err: any) {
      alert(`Failed to delete rule: ${err.message}`);
    }
  };

  const handleToggleActive = async (rule: any) => {
    try {
      await api.updateAdminRule(rule.id, { is_active: !rule.is_active });
      fetchRules();
    } catch (err: any) {
      alert(`Error toggling rule: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-secondary" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              System Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Deterministic Risk Rules Engine</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
            Configure business rules that interpret extracted document evidence into mathematical Likelihood and Impact scores.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rule</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold flex items-center gap-2 border border-tertiary-fixed-dim/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && !isModalOpen && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2 border border-error/40">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-primary">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-on-surface-variant">No rules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wider text-primary font-black">
                  <th className="py-3.5 px-6 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Risk Factor Name</th>
                  <th className="py-3.5 px-3 font-bold">Condition</th>
                  <th className="py-3.5 px-3 font-bold">Threshold</th>
                  <th className="py-3.5 px-3 font-bold text-center">Likelihood</th>
                  <th className="py-3.5 px-3 font-bold text-center">Impact</th>
                  <th className="py-3.5 px-3 font-bold">Severity</th>
                  <th className="py-3.5 px-3 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 font-bold text-secondary">{rule.category_code}</td>
                    <td className="py-4 px-4 font-bold text-primary max-w-[200px] truncate" title={rule.factor_name}>
                      {rule.factor_name}
                      <p className="text-[11px] text-on-surface font-medium truncate mt-0.5">{rule.description}</p>
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-primary">{rule.condition_operator}</td>
                    <td className="py-4 px-3 font-bold text-primary">{rule.threshold_value}</td>
                    <td className="py-4 px-3 text-center font-bold text-primary">{rule.likelihood_score} / 5</td>
                    <td className="py-4 px-3 text-center font-bold text-primary">{rule.impact_score} / 5</td>
                    <td className="py-4 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant">
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border cursor-pointer ${
                          rule.is_active
                            ? 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-fixed-dim/40'
                            : 'bg-surface-container text-on-surface border-outline-variant'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-primary">Add Deterministic Business Rule</h3>
              <button onClick={() => { setIsModalOpen(false); setErrorMsg(null); }} className="text-primary hover:text-error text-lg cursor-pointer font-bold">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-start gap-2 border border-error/40">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Risk Category
                  </label>
                  <select
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="FINANCIAL">FINANCIAL</option>
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="STRATEGIC">STRATEGIC</option>
                    <option value="LEGAL_REGULATORY">LEGAL_REGULATORY</option>
                    <option value="MARKET">MARKET</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Severity Tag
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                  Risk Factor Name / Keyword
                </label>
                <input
                  type="text"
                  required
                  value={factorName}
                  onChange={(e) => setFactorName(e.target.value)}
                  placeholder="e.g. Supplier Concentration, Debt-to-Equity Ratio, MFA Status"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Condition Operator
                  </label>
                  <select
                    value={conditionOperator}
                    onChange={(e) => setConditionOperator(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="GT">GT (&gt;)</option>
                    <option value="GTE">GTE (&gt;=)</option>
                    <option value="LT">LT (&lt;)</option>
                    <option value="LTE">LTE (&lt;=)</option>
                    <option value="EQ">EQ (==)</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="RANGE">RANGE (min..max)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Threshold Value
                  </label>
                  <input
                    type="text"
                    required
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    placeholder="e.g. 70%, 2.5, true, non-compliant"
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Likelihood Contribution (1 - 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={likelihoodScore}
                    onChange={(e) => setLikelihoodScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                    Impact Contribution (1 - 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={impactScore}
                    onChange={(e) => setImpactScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 uppercase tracking-wider">
                  Rule Rationale & Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this threshold elevates likelihood or impact..."
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container font-bold text-primary cursor-pointer hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {saving ? 'Creating...' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
