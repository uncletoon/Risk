// ============================================================================
// System Admin Service
// Manages users, risk categories, deterministic rules, and governance
// ============================================================================

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { logAudit } = require('./auditService');

// --- Users Management ---

async function getUsers() {
  const res = await pool.query(
    `SELECT u.id, u.organization_id, u.full_name, u.email, u.role, u.department, u.status, u.created_at,
            o.name as organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     ORDER BY u.created_at DESC`
  );
  return res.rows;
}

async function createUser({ organizationId, fullName, email, password, role, department }, adminUserId) {
  const hashedPassword = await bcrypt.hash(password || 'Officer@123', 10);
  const res = await pool.query(
    `INSERT INTO users (organization_id, full_name, email, password, role, department, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING id, organization_id, full_name, email, role, department, status, created_at`,
    [organizationId || 1, fullName, email, hashedPassword, role || 'RISK_OFFICER', department || 'Risk Management']
  );

  const newUser = res.rows[0];
  await logAudit(adminUserId, organizationId, 'USER_CREATED', 'users', newUser.id, { email, role });
  return newUser;
}

async function updateUser(userId, { fullName, role, department, status, organizationId }, adminUserId) {
  const res = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         role = COALESCE($2, role),
         department = COALESCE($3, department),
         status = COALESCE($4, status),
         organization_id = COALESCE($5, organization_id),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, organization_id, full_name, email, role, department, status, updated_at`,
    [fullName, role, department, status, organizationId, userId]
  );
  if (res.rows.length === 0) throw new Error('User not found');
  await logAudit(adminUserId, null, 'USER_UPDATED', 'users', userId, { role, status });
  return res.rows[0];
}

// --- Categories Management ---

async function getCategories() {
  const res = await pool.query('SELECT * FROM risk_categories ORDER BY code ASC');
  return res.rows;
}

async function updateCategoryWeight(code, defaultWeight, adminUserId) {
  const res = await pool.query(
    `UPDATE risk_categories
     SET default_weight = $1, updated_at = NOW()
     WHERE code = $2
     RETURNING *`,
    [defaultWeight, code]
  );
  if (res.rows.length === 0) throw new Error('Category not found');
  await logAudit(adminUserId, null, 'CATEGORY_WEIGHT_UPDATED', 'risk_categories', null, { code, defaultWeight });
  return res.rows[0];
}

// --- Risk Rules Management ---

async function getRules() {
  const res = await pool.query(
    `SELECT r.*, c.name as category_name
     FROM risk_rules r
     JOIN risk_categories c ON r.category_code = c.code
     ORDER BY r.category_code ASC, r.id ASC`
  );
  return res.rows;
}

async function createRule({ categoryCode, factorName, conditionOperator, thresholdValue, likelihoodScore, impactScore, severity, description }, adminUserId) {
  const res = await pool.query(
    `INSERT INTO risk_rules (category_code, factor_name, condition_operator, threshold_value, likelihood_score, impact_score, severity, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [categoryCode, factorName, conditionOperator, thresholdValue, likelihoodScore, impactScore, severity || 'Moderate', description || '']
  );
  const rule = res.rows[0];
  await logAudit(adminUserId, null, 'RULE_CREATED', 'risk_rules', rule.id, { factorName, thresholdValue });
  return rule;
}

async function updateRule(ruleId, updates, adminUserId) {
  const { category_code, factor_name, condition_operator, threshold_value, likelihood_score, impact_score, severity, description, is_active } = updates;
  const res = await pool.query(
    `UPDATE risk_rules
     SET category_code = COALESCE($1, category_code),
         factor_name = COALESCE($2, factor_name),
         condition_operator = COALESCE($3, condition_operator),
         threshold_value = COALESCE($4, threshold_value),
         likelihood_score = COALESCE($5, likelihood_score),
         impact_score = COALESCE($6, impact_score),
         severity = COALESCE($7, severity),
         description = COALESCE($8, description),
         is_active = COALESCE($9, is_active)
     WHERE id = $10
     RETURNING *`,
    [category_code, factor_name, condition_operator, threshold_value, likelihood_score, impact_score, severity, description, is_active, ruleId]
  );
  if (res.rows.length === 0) throw new Error('Rule not found');
  await logAudit(adminUserId, null, 'RULE_UPDATED', 'risk_rules', ruleId, updates);
  return res.rows[0];
}

async function deleteRule(ruleId, adminUserId) {
  await pool.query('DELETE FROM risk_rules WHERE id = $1', [ruleId]);
  await logAudit(adminUserId, null, 'RULE_DELETED', 'risk_rules', ruleId, {});
  return { success: true };
}

// --- System Metrics & Health ---

async function getSystemHealth() {
  const [usersCount, orgsCount, assessmentsCount, docsCount, risksCount, mitigationsCount, rulesCount] = await Promise.all([
    pool.query('SELECT count(*) FROM users'),
    pool.query('SELECT count(*) FROM organizations'),
    pool.query('SELECT count(*) FROM assessments'),
    pool.query('SELECT count(*) FROM documents'),
    pool.query('SELECT count(*) FROM identified_risks'),
    pool.query('SELECT count(*) FROM mitigation_actions'),
    pool.query('SELECT count(*) FROM risk_rules'),
  ]);

  return {
    status: 'HEALTHY',
    database: 'PostgreSQL Connected',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    metrics: {
      totalUsers: parseInt(usersCount.rows[0].count, 10),
      totalOrganizations: parseInt(orgsCount.rows[0].count, 10),
      totalAssessments: parseInt(assessmentsCount.rows[0].count, 10),
      totalDocuments: parseInt(docsCount.rows[0].count, 10),
      totalIdentifiedRisks: parseInt(risksCount.rows[0].count, 10),
      totalMitigations: parseInt(mitigationsCount.rows[0].count, 10),
      activeRules: parseInt(rulesCount.rows[0].count, 10),
    },
  };
}

module.exports = {
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
};
