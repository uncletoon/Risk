import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  api,
  AssessmentDetailsResponse,
  IdentifiedRisk,
  AIRecommendation,
} from '../lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Send,
  Plus,
  HelpCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Scale,
  ListTodo,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

export default function AssessmentDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'executive';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState<AssessmentDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Traceable Evidence Drawer
  const [expandedRiskId, setExpandedRiskId] = useState<number | null>(null);

  // Convert Recommendation to Mitigation Modal
  const [modalRec, setModalRec] = useState<AIRecommendation | null>(null);
  const [mitTitle, setMitTitle] = useState('');
  const [mitDesc, setMitDesc] = useState('');
  const [mitPriority, setMitPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [mitAssignee, setMitAssignee] = useState('Risk Operations Lead');
  const [mitDept, setMitDept] = useState('Operations');
  const [mitDueDate, setMitDueDate] = useState('');
  const [mitSaving, setMitSaving] = useState(false);

  // AI Advisor State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! I am your Contextual AI Risk Advisor. I am grounded strictly in the stored facts, calculations, and evidence of this assessment. Ask me about top risks, category drivers, controls, or mitigation priorities.',
    },
  ]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getAssessment(id!);
      setData(res);
      if (['PROCESSING', 'EXTRACTING', 'ASSESSING', 'ANALYZING'].includes(res.assessment.status)) {
        pollStatus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await api.getAssessment(id!);
        setData(res);
        if (res.assessment.status === 'COMPLETED' || res.assessment.status === 'FAILED') {
          clearInterval(interval);
          setProcessing(false);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000);
  };

  const handleRunPipeline = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await api.processAssessment(parseInt(id, 10));
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to trigger pipeline');
      setProcessing(false);
    }
  };

  const openConvertModal = (rec: AIRecommendation) => {
    setModalRec(rec);
    setMitTitle(rec.title);
    setMitDesc(rec.recommendation_text);
    setMitPriority(rec.priority === 'IMMEDIATE' ? 'CRITICAL' : rec.priority === 'SHORT_TERM' ? 'HIGH' : 'MEDIUM');
    setMitAssignee('Risk & Assurance Team');
    setMitDept(rec.category_code || 'Enterprise Risk');
    setMitDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  const handleSaveMitigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setMitSaving(true);
      await api.createMitigation({
        assessment_id: parseInt(id, 10),
        identified_risk_id: modalRec?.identified_risk_id,
        recommendation_id: modalRec?.id,
        title: mitTitle,
        action_description: mitDesc,
        priority: mitPriority,
        assigned_to: mitAssignee,
        department: mitDept,
        due_date: mitDueDate,
      });
      setModalRec(null);
      fetchDetails();
    } catch (err: any) {
      alert(`Failed to create mitigation action: ${err.message}`);
    } finally {
      setMitSaving(false);
    }
  };

  const handleSendAdvisor = async (queryText?: string) => {
    const question = queryText || advisorInput;
    if (!question.trim() || !id || advisorLoading) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: question }];
    setChatMessages(newMessages);
    setAdvisorInput('');
    setAdvisorLoading(true);

    try {
      const response = await api.askAdvisor({
        assessmentId: parseInt(id, 10),
        question,
        chatHistory: newMessages.slice(-6),
      });

      setChatMessages([...newMessages, { role: 'assistant', content: response.answer }]);
    } catch (err: any) {
      setChatMessages([
        ...newMessages,
        { role: 'assistant', content: `Advisor encountered an error: ${err.message}` },
      ]);
    } finally {
      setAdvisorLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-on-surface-variant">
        <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold">Loading Assessment Workspace...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-error font-semibold">
        {error || 'Assessment not found.'}
      </div>
    );
  }

  const { assessment, document, identifiedRisks, riskScores, aiAnalysis, recommendations, mitigations, extractedFacts } = data;
  const isCompleted = assessment.status === 'COMPLETED';
  const isFailed = assessment.status === 'FAILED';
  const isRunning = ['PROCESSING', 'EXTRACTING', 'ASSESSING', 'ANALYZING'].includes(assessment.status);

  // Radar Data
  const radarData = riskScores.map((c) => ({
    category: c.category_name?.replace(' Risk', '') || c.category_code,
    score: Number(c.category_score),
    fullMark: 100,
  }));

  return (
    <div className="space-y-6 pb-16">
      {/* Header Profile Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {assessment.org_name} ({assessment.org_industry || 'Enterprise'})
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">{assessment.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-1">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                <strong className="text-on-surface">Document:</strong> {document?.original_name || 'No document'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(assessment.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="font-semibold text-secondary">
                Single-Document Rule Enforced
              </span>
            </div>
          </div>

          {/* Right Side: ERI Score & Action */}
          <div className="flex items-center gap-4">
            {isCompleted && (
              <div className="text-right px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Calculated ERI
                </p>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-2xl font-extrabold text-primary">
                    {Number(assessment.overall_eri || 0).toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">/ 100</span>
                  <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEriBadgeBg(assessment.eri_classification)}`}>
                    {assessment.eri_classification}
                  </span>
                </div>
              </div>
            )}

            {(!isCompleted || isFailed) && (
              <button
                onClick={handleRunPipeline}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Processing Pipeline...' : isFailed ? 'Retry Assessment' : 'Start Assessment'}</span>
              </button>
            )}

            {isCompleted && (
              <Link
                to={`/reports?assessmentId=${assessment.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
              >
                <FileText className="w-4 h-4 text-secondary" />
                <span>View Report</span>
              </Link>
            )}
          </div>
        </div>

        {/* Real-Time Pipeline Progress Indicator */}
        {isRunning && (
          <div className="mt-5 pt-4 border-t border-outline-variant">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-secondary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                Status: {assessment.status} ({assessment.progress_step})
              </span>
              <span className="text-on-surface-variant font-medium">Deterministic Engine & Gemini AI Working...</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2 border border-error/30">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Processing failed: {assessment.failure_reason || 'Unknown error occurred'}</span>
          </div>
        )}
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-outline-variant gap-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('executive'); setSearchParams({ tab: 'executive' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'executive'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Executive Intelligence</span>
        </button>

        <button
          onClick={() => { setActiveTab('scores'); setSearchParams({ tab: 'scores' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'scores'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Deterministic ERI Scores ({riskScores.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('risks'); setSearchParams({ tab: 'risks' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'risks'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Identified Risks & Evidence ({identifiedRisks.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('controls'); setSearchParams({ tab: 'controls' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Controls Evaluation</span>
        </button>

        <button
          onClick={() => { setActiveTab('recommendations'); setSearchParams({ tab: 'recommendations' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'recommendations'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>AI Recommendations ({recommendations.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('advisor'); setSearchParams({ tab: 'advisor' }); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'advisor'
              ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Grounded AI Advisor</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE BRIEFING & AI ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          {aiAnalysis ? (
            <>
              {/* Executive Summary Card */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h2 className="text-base font-bold text-primary">Board Executive Summary</h2>
                </div>
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line font-medium">
                  {aiAnalysis.executive_summary}
                </p>
              </div>

              {/* Risk Position Overview & Strategic Outlook */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-primary">Organizational Risk Position & Resilience</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {aiAnalysis.risk_position_overview || 'No additional position narrative generated.'}
                  </p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-primary">Strategic Implications (12 - 24 Month Horizon)</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {aiAnalysis.strategic_implications || 'Maintain vigilance over unmitigated high-residual risks.'}
                  </p>
                </div>
              </div>

              {/* Top Risk Drivers */}
              {aiAnalysis.top_risk_drivers && aiAnalysis.top_risk_drivers.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-primary">Top Identified Risk Drivers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiAnalysis.top_risk_drivers.map((driver: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold text-secondary">
                            {driver.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-primary">{driver.driver_title}</h4>
                        <p className="text-[11px] text-on-surface-variant leading-normal">
                          {driver.impact_summary}
                        </p>
                        {driver.supporting_evidence && (
                          <div className="pt-2 border-t border-outline-variant/40 text-[10px] text-outline italic">
                            "{driver.supporting_evidence}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant text-center space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-outline opacity-40" />
              <p className="text-sm font-bold text-primary">AI Executive Analysis Pending</p>
              <p className="text-xs text-on-surface-variant">
                Launch the assessment pipeline to trigger fact extraction, deterministic scoring, and executive analysis.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DETERMINISTIC RISK SCORING & CATEGORY BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === 'scores' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-bold text-primary">Deterministic Category Scores & Weights</h2>
                <p className="text-xs text-on-surface-variant">
                  Formula: ERI = Sum(Category Score × Category Weight) / Sum(Weight)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-3 font-bold text-right">Score (0-100)</th>
                      <th className="py-3 px-3 font-bold text-right">Weight</th>
                      <th className="py-3 px-4 font-bold text-right">Weighted Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {riskScores.map((cat) => (
                      <tr key={cat.id} className="hover:bg-surface-container-low">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-primary">{cat.category_name}</p>
                          <p className="text-[10px] text-on-surface-variant">{cat.category_desc}</p>
                        </td>
                        <td className="py-3.5 px-3 text-right font-extrabold text-primary">
                          {Number(cat.category_score).toFixed(1)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold text-on-surface">
                          {Number(cat.category_weight)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-secondary">
                          {Number(cat.weighted_score).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-outline font-bold text-sm bg-surface-container-low">
                      <td className="py-3.5 px-4 text-primary">Enterprise Risk Index (ERI)</td>
                      <td colSpan={2} className="py-3.5 px-3 text-right text-xs text-on-surface-variant">
                        Classification: <strong>{assessment.eri_classification}</strong>
                      </td>
                      <td className="py-3.5 px-4 text-right text-primary text-base font-extrabold">
                        {Number(assessment.overall_eri || 0).toFixed(1)} / 100
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="text-base font-bold text-primary">Multidimensional Footprint</h3>
                <p className="text-xs text-on-surface-variant">Normalized 0–100 scale across all 6 domains</p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#c4c6cc" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#44474c', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#74777d', fontSize: 9 }} />
                    <Radar name="Category Score" dataKey="score" stroke="#815600" fill="#ffba4b" fillOpacity={0.45} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant">
                <strong>Governance Rule:</strong> Category scores are computed deterministically from residual risk values and never generated arbitrarily by AI.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: IDENTIFIED RISKS & TRACEABLE EVIDENCE */}
      {/* ========================================================================= */}
      {activeTab === 'risks' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-primary">Identified Risks & Traceable Evidence Register</h2>
            <p className="text-xs text-on-surface-variant">
              Every identified risk links directly to extracted document facts, deterministic rules, and exact page/sheet citations.
            </p>
          </div>

          <div className="space-y-3">
            {identifiedRisks.map((risk) => {
              const isExpanded = expandedRiskId === risk.id;
              return (
                <div
                  key={risk.id}
                  className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low transition-all"
                >
                  <div
                    onClick={() => setExpandedRiskId(isExpanded ? null : risk.id)}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                          {risk.category_name || risk.category_code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEriBadgeBg(risk.residual_classification)}`}>
                          {risk.residual_classification} (Residual: {Number(risk.residual_risk).toFixed(1)})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-primary">{risk.risk_name}</h4>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{risk.risk_description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right text-xs">
                        <p className="text-[10px] text-on-surface-variant">Likelihood × Impact</p>
                        <p className="font-bold text-primary">
                          {risk.likelihood} × {risk.impact} = {risk.inherent_risk} / 25
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <p className="text-[10px] text-on-surface-variant">Control Effect</p>
                        <p className="font-bold text-secondary">
                          {risk.control_status === 'EVALUATED' ? `-${risk.control_score}%` : '0% (No data)'}
                        </p>
                      </div>

                      <div className="p-1 rounded-lg text-outline">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Traceability Drawer */}
                  {isExpanded && (
                    <div className="p-5 bg-surface-container-lowest border-t border-outline-variant/60 space-y-4 animate-in fade-in duration-150">
                      <div>
                        <h5 className="text-xs font-bold text-primary mb-1">Detailed Risk Mechanism:</h5>
                        <p className="text-xs text-on-surface leading-relaxed">{risk.risk_description}</p>
                      </div>

                      {/* Traceable Evidence Citations */}
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-secondary" />
                          <h5 className="text-xs font-bold text-primary">Verbatim Document Evidence & Traceability:</h5>
                        </div>
                        {risk.evidence_list && risk.evidence_list.length > 0 ? (
                          risk.evidence_list.map((ev, idx) => (
                            <div key={idx} className="space-y-1 text-xs">
                              <blockquote className="italic text-on-surface border-l-2 border-secondary pl-3">
                                "{ev.evidence_text}"
                              </blockquote>
                              <p className="text-[10px] text-outline font-semibold pl-3">
                                Source Reference: <strong>{ev.source_location || 'Document Body'}</strong> (Confidence: {ev.confidence || 'High'})
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-on-surface-variant italic">
                            Evidence extracted directly from primary business document facts.
                          </p>
                        )}
                      </div>

                      {/* Evaluated Controls */}
                      {risk.controls_list && risk.controls_list.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-primary mb-1.5">Identified Internal Controls:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {risk.controls_list.map((ctrl, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-xs">
                                <div className="flex justify-between font-bold text-on-surface">
                                  <span>{ctrl.control_name}</span>
                                  <span className="text-secondary">{ctrl.effectiveness_pct}% Effective</span>
                                </div>
                                {ctrl.source_evidence && (
                                  <p className="text-[10px] text-on-surface-variant mt-0.5 italic">
                                    "{ctrl.source_evidence}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERNAL CONTROLS EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'controls' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-primary">Internal Controls & Governance Evaluation</h2>
            <p className="text-xs text-on-surface-variant">
              Controls are evaluated strictly where evidence exists in the document. Insufficient data is flagged explicitly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {identifiedRisks.map((risk) => (
              <div key={risk.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary">
                      {risk.category_name}
                    </span>
                    <h4 className="text-xs font-bold text-primary">{risk.risk_name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.control_status === 'EVALUATED'
                        ? 'bg-tertiary-container/20 text-on-tertiary-container'
                        : 'bg-surface-container text-outline'
                    }`}
                  >
                    {risk.control_status === 'EVALUATED' ? `${risk.control_score}% Effective` : 'INSUFFICIENT DATA'}
                  </span>
                </div>

                {risk.controls_list && risk.controls_list.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                    {risk.controls_list.map((c, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between font-semibold text-on-surface">
                          <span>{c.control_name}</span>
                          <span className="text-secondary">{c.effectiveness_pct}%</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{c.source_evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-outline-variant/40 text-[11px] text-on-surface-variant italic">
                    The uploaded document contains no verifiable control information for this risk factor. Conservative full inherent risk applied.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AI MITIGATION RECOMMENDATIONS & PRIORITIES */}
      {/* ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-primary">AI Actionable Recommendations & Prioritization</h2>
              <p className="text-xs text-on-surface-variant">
                Strategic recommendations linked directly to identified evidence. Convert recommendations to formal mitigation actions with one click.
              </p>
            </div>
            <Link
              to="/mitigations"
              className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
            >
              <span>View Active Mitigation Actions ({mitigations.length})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec) => {
              const isImmediate = rec.priority === 'IMMEDIATE';
              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isImmediate
                            ? 'bg-error-container text-on-error-container border-error/30'
                            : 'bg-secondary-container/20 text-secondary border-secondary-container/40'
                        }`}
                      >
                        {rec.priority.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-semibold">
                        {rec.suggested_timeframe}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-primary">{rec.title}</h4>
                    <p className="text-xs text-on-surface leading-relaxed">{rec.recommendation_text}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-outline-variant/60">
                    {rec.expected_outcome && (
                      <div className="text-[11px] text-on-surface-variant">
                        <strong>Expected Outcome:</strong> {rec.expected_outcome}
                      </div>
                    )}

                    <button
                      onClick={() => openConvertModal(rec)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Convert to Mitigation Action</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GROUNDED AI RISK ADVISOR */}
      {/* ========================================================================= */}
      {activeTab === 'advisor' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs flex flex-col h-[650px]">
          <div className="mb-3">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span>Grounded AI Risk Advisor</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Directly grounded in this assessment's facts, calculated scores, and extracted document evidence.
            </p>
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-outline-variant">
            {[
              'What is our biggest enterprise risk and why?',
              'Why is our technology & cyber risk elevated?',
              'What could happen if we ignore supplier dependency?',
              'Which mitigation actions should management execute first?',
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAdvisor(pill)}
                disabled={advisorLoading}
                className="px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant hover:bg-surface-container-high text-[11px] font-semibold text-on-surface transition-colors cursor-pointer text-left"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Transcript Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary font-medium'
                      : 'bg-surface-container-low border border-outline-variant text-on-surface whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {advisorLoading && (
              <div className="flex items-center gap-2 text-xs text-secondary font-semibold p-2">
                <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing assessment context & drafting grounded advice...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="mt-4 pt-3 border-t border-outline-variant flex gap-2">
            <input
              type="text"
              value={advisorInput}
              onChange={(e) => setAdvisorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisor()}
              placeholder="Ask a question about this assessment (e.g. Why is technological risk high?)..."
              className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => handleSendAdvisor()}
              disabled={advisorLoading || !advisorInput.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Ask Advisor</span>
            </button>
          </div>
        </div>
      )}

      {/* Convert to Mitigation Action Modal */}
      {modalRec && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-primary">Convert Recommendation into Action</h3>
              <button
                onClick={() => setModalRec(null)}
                className="text-outline hover:text-on-surface text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMitigation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  value={mitTitle}
                  onChange={(e) => setMitTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Action Implementation Plan
                </label>
                <textarea
                  rows={3}
                  required
                  value={mitDesc}
                  onChange={(e) => setMitDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={mitPriority}
                    onChange={(e: any) => setMitPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={mitDueDate}
                    onChange={(e) => setMitDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Assigned Person / Lead
                  </label>
                  <input
                    type="text"
                    value={mitAssignee}
                    onChange={(e) => setMitAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Responsible Department
                  </label>
                  <input
                    type="text"
                    value={mitDept}
                    onChange={(e) => setMitDept(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setModalRec(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mitSaving}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {mitSaving ? 'Saving Action...' : 'Save Mitigation Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
