// ============================================================================
// Mitigation Controller
// ============================================================================

const {
  createMitigationAction,
  updateMitigationAction,
  getMitigationsByAssessment,
  getAllMitigations,
  getMitigationStats,
} = require('../services/mitigationService');

const createMitigation = async (req, res) => {
  try {
    const action = await createMitigationAction({
      ...req.body,
      userId: req.user?.id,
    });
    res.status(201).json(action);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateMitigation = async (req, res) => {
  try {
    const updated = await updateMitigationAction(req.params.id, req.body, req.user?.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listMitigations = async (req, res) => {
  try {
    const { assessmentId, organizationId } = req.query;
    if (assessmentId) {
      const actions = await getMitigationsByAssessment(assessmentId);
      return res.json(actions);
    }
    const orgId = organizationId || (req.user?.role !== 'SYSTEM_ADMIN' ? req.user?.organization_id : null);
    const actions = await getAllMitigations(orgId);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mitigations', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const orgId = req.query.organizationId || (req.user?.role !== 'SYSTEM_ADMIN' ? req.user?.organization_id : null);
    const stats = await getMitigationStats(orgId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mitigation stats', error: err.message });
  }
};

module.exports = {
  createMitigation,
  updateMitigation,
  listMitigations,
  getStats,
};
