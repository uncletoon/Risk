// ============================================================================
// System Admin Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SYSTEM_ADMIN'));

// Users
router.get('/users', listUsers);
router.post('/users', createNewUser);
router.put('/users/:id', updateUserData);

// Categories
router.get('/categories', listCategories);
router.put('/categories/:code/weight', updateWeight);

// Rules
router.get('/rules', listRules);
router.post('/rules', createNewRule);
router.put('/rules/:id', updateRuleData);
router.delete('/rules/:id', deleteRuleItem);

// Audit & Health
router.get('/audit-logs', listAuditLogs);
router.get('/health', getHealth);

module.exports = router;
