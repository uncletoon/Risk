// ============================================================================
// Report Controller
// ============================================================================

const { generateAssessmentReport } = require('../services/reportService');

const getReport = async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.assessmentId, 10);
    const report = await generateAssessmentReport(assessmentId);
    res.json(report);
  } catch (err) {
    console.error('getReport error:', err);
    res.status(404).json({ message: err.message });
  }
};

module.exports = {
  getReport,
};
