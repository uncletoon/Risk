// ============================================================================
// AI Risk Advisor Controller
// Grounded in the specific assessment's stored facts, scores, and evidence
// ============================================================================

const { getAssessmentDetails } = require('../services/assessmentService');
const { queryContextualAdvisor } = require('../integrations/gemini/geminiService');

const askAdvisor = async (req, res) => {
  try {
    const { assessmentId, question, chatHistory } = req.body;

    if (!assessmentId || !question) {
      return res.status(400).json({ message: 'assessmentId and question are required' });
    }

    // Retrieve full assessment context
    const assessmentData = await getAssessmentDetails(parseInt(assessmentId, 10));

    const assessmentSummary = {
      organization: {
        name: assessmentData.assessment.org_name,
        industry: assessmentData.assessment.org_industry,
      },
      assessment: {
        title: assessmentData.assessment.title,
        overallERI: assessmentData.assessment.overall_eri,
        classification: assessmentData.assessment.eri_classification,
        summary: assessmentData.assessment.document_summary,
      },
      categoryScores: assessmentData.riskScores,
      identifiedRisks: assessmentData.identifiedRisks.map(r => ({
        category: r.category_code,
        name: r.risk_name,
        description: r.risk_description,
        likelihood: r.likelihood,
        impact: r.impact,
        inherentRisk: r.inherent_risk,
        controlEffectiveness: r.control_score,
        residualRisk: r.residual_risk,
        classification: r.residual_classification,
        evidence: r.evidence_list,
      })),
      aiAnalysis: assessmentData.aiAnalysis,
      recommendations: assessmentData.recommendations,
      mitigations: assessmentData.mitigations,
    };

    const response = await queryContextualAdvisor(question, assessmentSummary, chatHistory || []);

    res.json({
      question,
      answer: response.answer,
      groundedAssessmentId: assessmentId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('askAdvisor error:', err);
    res.status(500).json({ message: 'AI Advisor query failed', error: err.message });
  }
};

module.exports = {
  askAdvisor,
};
