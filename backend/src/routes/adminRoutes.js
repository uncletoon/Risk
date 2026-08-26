// ============================================================================
// System Admin Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  listUsers,
  getUserData,
  createNewUser,
  updateUserData,
  updateUserStatusHandler,
  listCategories,
  updateWeight,
  updateWeightsBatch,
  listRules,
  createNewRule,
  updateRuleData,
  deleteRuleItem,
  listAuditLogs,
  exportAuditLogs,
  getHealth,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SYSTEM_ADMIN'));

// Users
router.get('/users', listUsers);
router.get('/users/:id', getUserData);
router.post('/users', createNewUser);
router.put('/users/:id', updateUserData);
router.patch('/users/:id/status', updateUserStatusHandler);

// Categories
router.get('/categories', listCategories);
router.put('/categories/weights', updateWeightsBatch);
router.put('/categories/:code/weight', updateWeight);

// Rules
router.get('/rules', listRules);
router.post('/rules', createNewRule);
router.put('/rules/:id', updateRuleData);
router.delete('/rules/:id', deleteRuleItem);

// Audit & Health
router.get('/audit-logs', listAuditLogs);
router.get('/audit-logs/export', exportAuditLogs);
router.get('/health', getHealth);

module.exports = router;
