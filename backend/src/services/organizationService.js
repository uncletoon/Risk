// ============================================================================
// Organization Service
// ============================================================================

const { pool } = require('../config/db');

async function getOrganizations() {
  const res = await pool.query('SELECT * FROM organizations ORDER BY name ASC');
  return res.rows;
}

async function getOrganizationById(id) {
  const res = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
  if (res.rows.length === 0) {
    throw new Error('Organization not found');
  }
  return res.rows[0];
}

async function createOrganization({ name, industry, description, contact_email }) {
  const res = await pool.query(
    `INSERT INTO organizations (name, industry, description, contact_email)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, industry || 'Financial & Enterprise Services', description || '', contact_email || '']
  );
  return res.rows[0];
}

async function updateOrganization(id, { name, industry, description, contact_email }) {
  const res = await pool.query(
    `UPDATE organizations 
     SET name = COALESCE($1, name),
         industry = COALESCE($2, industry),
         description = COALESCE($3, description),
         contact_email = COALESCE($4, contact_email),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name, industry, description, contact_email, id]
  );
  if (res.rows.length === 0) {
    throw new Error('Organization not found');
  }
  return res.rows[0];
}

module.exports = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
};
