// ============================================================================
// Mitigation Management Service
// ============================================================================

const { pool } = require('../config/db');
const { logAudit } = require('./auditService');
const { MITIGATION_STATUSES } = require('../constants/riskConstants');

async function createMitigationAction({
  assessmentId,
  identifiedRiskId,
  recommendationId,
  title,
  actionDescription,
  priority = 'HIGH',
  assignedTo,
  department,
  dueDate,
  expectedOutcome,
  notes,
  userId,
}) {
  const assessRes = await pool.query('SELECT organization_id FROM assessments WHERE id = $1', [assessmentId]);
  if (assessRes.rows.length === 0) {
    throw new Error('Assessment not found');
  }
  const orgId = assessRes.rows[0].organization_id;

  const res = await pool.query(
    `INSERT INTO mitigation_actions (
      assessment_id, identified_risk_id, recommendation_id, title, action_description,
      priority, assigned_to, department, due_date, status, progress_pct, expected_outcome, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      assessmentId,
      identifiedRiskId || null,
      recommendationId || null,
      title,
      actionDescription || '',
      priority || 'HIGH',
      assignedTo || 'Unassigned',
      department || 'Risk & Operations',
      dueDate || null,
      MITIGATION_STATUSES.PENDING,
      0,
      expectedOutcome || '',
      notes || '',
    ]
  );

  const action = res.rows[0];
  await logAudit(userId, orgId, 'MITIGATION_ACTION_CREATED', 'mitigation_actions', action.id, { title, priority });
  return action;
}

async function updateMitigationAction(id, updates, userId) {
  const {
    title,
    action_description,
    priority,
    assigned_to,
    department,
    due_date,
    status,
    progress_pct,
    expected_outcome,
    notes,
  } = updates;

  let computedProgress = progress_pct;
  if (status === 'COMPLETED' && (computedProgress === undefined || computedProgress < 100)) {
    computedProgress = 100;
  }

  const res = await pool.query(
    `UPDATE mitigation_actions
     SET title = COALESCE($1, title),
         action_description = COALESCE($2, action_description),
         priority = COALESCE($3, priority),
         assigned_to = COALESCE($4, assigned_to),
         department = COALESCE($5, department),
         due_date = COALESCE($6, due_date),
         status = COALESCE($7, status),
         progress_pct = COALESCE($8, progress_pct),
         expected_outcome = COALESCE($9, expected_outcome),
         notes = COALESCE($10, notes),
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [
      title,
      action_description,
      priority,
      assigned_to,
      department,
      due_date,
      status,
      computedProgress,
      expected_outcome,
      notes,
      id,
    ]
  );

  if (res.rows.length === 0) {
    throw new Error('Mitigation action not found');
  }

  const updated = res.rows[0];
  await logAudit(userId, null, 'MITIGATION_ACTION_UPDATED', 'mitigation_actions', id, { status, progress_pct: computedProgress });
  return updated;
}

async function getMitigationsByAssessment(assessmentId) {
  const res = await pool.query(
    `SELECT m.*, r.risk_name, r.category_code, r.residual_risk, r.residual_classification
     FROM mitigation_actions m
     LEFT JOIN identified_risks r ON m.identified_risk_id = r.id
     WHERE m.assessment_id = $1
     ORDER BY m.created_at DESC`,
    [assessmentId]
  );
  return res.rows;
}

async function getAllMitigations(organizationId = null) {
  let query = `
    SELECT m.*, a.title as assessment_title, o.name as org_name,
           r.risk_name, r.category_code, r.residual_risk, r.residual_classification
    FROM mitigation_actions m
    JOIN assessments a ON m.assessment_id = a.id
    JOIN organizations o ON a.organization_id = o.id
    LEFT JOIN identified_risks r ON m.identified_risk_id = r.id
  `;
  const params = [];

  if (organizationId) {
    query += ' WHERE a.organization_id = $1';
    params.push(organizationId);
  }

  query += ' ORDER BY m.created_at DESC';

  const res = await pool.query(query, params);
  return res.rows;
}

async function getMitigationStats(organizationId = null) {
  let filter = '';
  const params = [];
  if (organizationId) {
    filter = 'JOIN assessments a ON m.assessment_id = a.id WHERE a.organization_id = $1';
    params.push(organizationId);
  }

  const res = await pool.query(
    `SELECT 
       COUNT(*) as total_actions,
       COUNT(*) FILTER (WHERE m.status = 'PENDING') as pending_count,
       COUNT(*) FILTER (WHERE m.status = 'IN_PROGRESS') as in_progress_count,
       COUNT(*) FILTER (WHERE m.status = 'COMPLETED') as completed_count,
       COUNT(*) FILTER (WHERE m.status = 'CANCELLED') as cancelled_count,
       COALESCE(AVG(m.progress_pct), 0) as average_progress
     FROM mitigation_actions m
     ${filter}`,
    params
  );

  return res.rows[0];
}

module.exports = {
  createMitigationAction,
  updateMitigationAction,
  getMitigationsByAssessment,
  getAllMitigations,
  getMitigationStats,
};
