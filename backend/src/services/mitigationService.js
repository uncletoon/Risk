// ============================================================================
// Mitigation Management Service
// ============================================================================

const { pool } = require('../config/db');
const { logAudit } = require('./auditService');
const { MITIGATION_STATUSES } = require('../constants/riskConstants');

async function createMitigationAction(payload) {
  const assessmentId = payload.assessmentId || payload.assessment_id;
  const identifiedRiskId = payload.identifiedRiskId || payload.identified_risk_id || null;
  const recommendationId = payload.recommendationId || payload.recommendation_id || null;
  const title = payload.title;
  const actionDescription = payload.actionDescription || payload.action_description || '';
  const priority = payload.priority || 'HIGH';
  const assignedTo = payload.assignedTo || payload.assigned_to || 'Unassigned';
  const department = payload.department || 'Risk & Operations';
  const dueDate = payload.dueDate || payload.due_date || null;
  const expectedOutcome = payload.expectedOutcome || payload.expected_outcome || '';
  const notes = payload.notes || '';
  const userId = payload.userId;

  let finalAssessmentId = assessmentId;
  if (!finalAssessmentId) {
    const latestAssess = await pool.query('SELECT id, organization_id FROM assessments ORDER BY id DESC LIMIT 1');
    if (latestAssess.rows.length === 0) {
      throw new Error('Assessment not found. Please create an assessment first.');
    }
    finalAssessmentId = latestAssess.rows[0].id;
  }

  const assessRes = await pool.query('SELECT organization_id FROM assessments WHERE id = $1', [finalAssessmentId]);
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
      finalAssessmentId,
      identifiedRiskId,
      recommendationId,
      title,
      actionDescription,
      priority,
      assignedTo,
      department,
      dueDate,
      MITIGATION_STATUSES.PENDING,
      0,
      expectedOutcome,
      notes,
    ]
  );

  const action = res.rows[0];
  await logAudit(userId, orgId, 'MITIGATION_ACTION_CREATED', 'mitigation_actions', action.id, { title, priority });
  return action;
}

async function updateMitigationAction(id, updates, userId) {
  const currentRes = await pool.query('SELECT * FROM mitigation_actions WHERE id = $1', [id]);
  if (currentRes.rows.length === 0) {
    throw new Error('Mitigation action not found');
  }
  const current = currentRes.rows[0];

  // If already completed (100%), lock from modification as per business requirement
  if (current.progress_pct === 100 || current.status === 'COMPLETED') {
    if (updates.progress_pct !== undefined && Number(updates.progress_pct) < 100) {
      throw new Error('Completed mitigation actions (100% progress) are finalized and cannot be modified.');
    }
    if (updates.status !== undefined && updates.status !== 'COMPLETED') {
      throw new Error('Completed mitigation actions are finalized and locked.');
    }
  }

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

  let computedProgress = progress_pct !== undefined ? Number(progress_pct) : current.progress_pct;
  let computedStatus = status || current.status;

  if (computedProgress >= 100) {
    computedProgress = 100;
    computedStatus = 'COMPLETED';
  } else if (computedProgress > 0 && computedProgress < 100) {
    computedStatus = 'IN_PROGRESS';
  } else if (computedProgress === 0) {
    computedStatus = 'PENDING';
  }

  const res = await pool.query(
    `UPDATE mitigation_actions
     SET title = COALESCE($1, title),
         action_description = COALESCE($2, action_description),
         priority = COALESCE($3, priority),
         assigned_to = COALESCE($4, assigned_to),
         department = COALESCE($5, department),
         due_date = COALESCE($6, due_date),
         status = $7,
         progress_pct = $8,
         expected_outcome = COALESCE($9, expected_outcome),
         notes = COALESCE($10, notes),
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [
      title || null,
      action_description || null,
      priority || null,
      assigned_to || null,
      department || null,
      due_date || null,
      computedStatus,
      computedProgress,
      expected_outcome || null,
      notes || null,
      id,
    ]
  );

  const updated = res.rows[0];
  await logAudit(userId, null, 'MITIGATION_ACTION_UPDATED', 'mitigation_actions', id, { status: computedStatus, progress_pct: computedProgress });
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
