// ============================================================================
// Assessment Controller
// ============================================================================

const {
  createAssessment,
  attachDocument,
  runAssessmentPipeline,
  getAssessmentDetails,
  getAssessments,
} = require('../services/assessmentService');

const createAssessmentHandler = async (req, res) => {
  try {
    const { organizationId, title } = req.body;
    const orgId = organizationId || req.user?.organization_id;
    if (!orgId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const assessment = await createAssessment({
      organizationId: orgId,
      userId: req.user?.id,
      title: title || 'Enterprise Risk Assessment',
    });

    res.status(201).json(assessment);
  } catch (err) {
    console.error('createAssessment error:', err);
    res.status(400).json({ message: err.message });
  }
};

const uploadDocumentHandler = async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id, 10);
    const allowReplace = req.query.replace === 'true';

    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded. Please attach a PDF, DOCX, XLSX, or CSV file.' });
    }

    const doc = await attachDocument({
      assessmentId,
      file: req.file,
      userId: req.user?.id,
      allowReplace,
    });

    res.status(201).json({
      message: 'Document attached successfully to assessment',
      document: doc,
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    res.status(400).json({ message: err.message });
  }
};

const startAssessmentPipelineHandler = async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    // Run pipeline synchronously or return status after initiation
    const result = await runAssessmentPipeline(assessmentId, userId);

    res.json({
      message: 'Assessment pipeline executed successfully',
      assessment: result.assessment,
      overallERI: result.assessment.overall_eri,
      classification: result.assessment.eri_classification,
      data: result,
    });
  } catch (err) {
    console.error('startAssessmentPipeline error:', err);
    res.status(500).json({
      message: 'Assessment pipeline processing failed',
      error: err.message,
    });
  }
};

const getAssessmentDetailsHandler = async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id, 10);
    const details = await getAssessmentDetails(assessmentId);
    res.json(details);
  } catch (err) {
    console.error('getAssessmentDetails error:', err);
    res.status(404).json({ message: err.message });
  }
};

const getAssessmentStatusHandler = async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id, 10);
    const details = await getAssessmentDetails(assessmentId);
    res.json({
      id: details.assessment.id,
      title: details.assessment.title,
      status: details.assessment.status,
      progressStep: details.assessment.progress_step,
      failureReason: details.assessment.failure_reason,
      overallERI: details.assessment.overall_eri,
      eriClassification: details.assessment.eri_classification,
      completedAt: details.assessment.completed_at,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const listAssessmentsHandler = async (req, res) => {
  try {
    const orgId = req.query.organizationId || (req.user?.role !== 'SYSTEM_ADMIN' ? req.user?.organization_id : null);
    const assessments = await getAssessments(orgId);
    res.json(assessments);
  } catch (err) {
    console.error('listAssessments error:', err);
    res.status(500).json({ message: 'Failed to fetch assessments', error: err.message });
  }
};

module.exports = {
  createAssessmentHandler,
  uploadDocumentHandler,
  startAssessmentPipelineHandler,
  getAssessmentDetailsHandler,
  getAssessmentStatusHandler,
  listAssessmentsHandler,
};
