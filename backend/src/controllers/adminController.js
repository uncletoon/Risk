// ============================================================================
// System Admin Controller
// ============================================================================

const {
  getUsers,
  createUser,
  updateUser,
  getCategories,
  updateCategoryWeight,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getSystemHealth,
} = require('../services/adminService');
const { getAuditLogs } = require('../services/auditService');

// User Management
const listUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

const createNewUser = async (req, res) => {
  try {
    const user = await createUser(req.body, req.user?.id);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUserData = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body, req.user?.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Category Management
const listCategories = async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

const updateWeight = async (req, res) => {
  try {
    const { code } = req.params;
    const { defaultWeight } = req.body;
    const updated = await updateCategoryWeight(code, parseFloat(defaultWeight), req.user?.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Rules Management
const listRules = async (req, res) => {
  try {
    const rules = await getRules();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rules', error: err.message });
  }
};

const createNewRule = async (req, res) => {
  try {
    const rule = await createRule(req.body, req.user?.id);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateRuleData = async (req, res) => {
  try {
    const rule = await updateRule(req.params.id, req.body, req.user?.id);
    res.json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteRuleItem = async (req, res) => {
  try {
    const result = await deleteRule(req.params.id, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Audit Logs & Health
const listAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = await getAuditLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};

const getHealth = async (req, res) => {
  try {
    const health = await getSystemHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ message: 'Health check failed', error: err.message });
  }
};

module.exports = {
  listUsers,
  createNewUser,
  updateUserData,
  listCategories,
  updateWeight,
  listRules,
  createNewRule,
  updateRuleData,
  deleteRuleItem,
  listAuditLogs,
  getHealth,
};
