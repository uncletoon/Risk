// ============================================================================
// Auth Service
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'eridss-enterprise-risk-secret-key-2026';

async function authenticateUser(email, password) {
  const res = await pool.query(
    `SELECT u.*, o.name as organization_name 
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE LOWER(u.email) = LOWER($1) AND u.status = 'active'`,
    [email]
  );

  if (res.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = res.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    department: user.department,
    organization_id: user.organization_id,
    organization_name: user.organization_name,
    token,
  };
}

async function getUserById(userId) {
  const res = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.department, u.status, u.organization_id, o.name as organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1`,
    [userId]
  );
  if (res.rows.length === 0) {
    throw new Error('User not found');
  }
  return res.rows[0];
}

module.exports = {
  authenticateUser,
  getUserById,
  JWT_SECRET,
};
