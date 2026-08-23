// ============================================================================
// Dashboard Controller
// ============================================================================

const { getDashboardMetrics } = require('../services/dashboardService');

const getDashboard = async (req, res) => {
  try {
    const orgId = req.query.organizationId || (req.user?.role !== 'SYSTEM_ADMIN' ? req.user?.organization_id : null);
    const metrics = await getDashboardMetrics(orgId);
    res.json(metrics);
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard metrics', error: err.message });
  }
};

module.exports = {
  getDashboard,
};
