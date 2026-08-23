// ============================================================================
// Audit Service
// ============================================================================

const { pool } = require('../config/db');

async function logAudit(userId, organizationId, action, entityType, entityId, details = {}, ipAddress = '127.0.0.1') {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, organization_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId || null,
        organizationId || null,
        action,
        entityType,
        entityId || null,
        JSON.stringify(details || {}),
        ipAddress || '127.0.0.1',
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

async function getAuditLogs(limit = 100) {
  const res = await pool.query(
    `SELECT a.*, u.full_name as user_name, u.email as user_email, o.name as organization_name
     FROM audit_logs a
     LEFT JOIN users u ON a.user_id = u.id
     LEFT JOIN organizations o ON a.organization_id = o.id
     ORDER BY a.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows;
}

module.exports = {
  logAudit,
  getAuditLogs,
};
