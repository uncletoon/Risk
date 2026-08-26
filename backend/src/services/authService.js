// ============================================================================
// Auth Service
// ============================================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const JWT_SECRET =
  process.env.JWT_SECRET || "eridss-enterprise-risk-secret-key-2026";

async function authenticateUser(email, password) {
  const res = await pool.query(
    `SELECT u.*, o.name as organization_name 
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE LOWER(u.email) = LOWER($1) AND u.status = 'active'`,
    [email],
  );

  if (res.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = res.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
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
    { expiresIn: "24h" },
  );

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number,
    gender: user.gender,
    role: user.role,
    department: user.department,
    organization_id: user.organization_id,
    organization_name: user.organization_name,
    token,
  };
}

async function getUserById(userId) {
  const res = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone_number, u.gender, u.role, u.department, u.status, u.organization_id, o.name as organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1`,
    [userId],
  );
  if (res.rows.length === 0) {
    throw new Error("User not found");
  }
  return res.rows[0];
}

const {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  checkUserUniqueness,
} = require("../utils/validation");

async function updateUserProfile(
  userId,
  { fullName, email, phoneNumber, gender },
) {
  const cleanName = fullName ? validateFullName(fullName) : null;
  const cleanEmail = email ? validateEmail(email, true) : null;
  const cleanPhone = phoneNumber ? validatePhoneNumber(phoneNumber) : null;

  // Check email and phone uniqueness in database
  await checkUserUniqueness(pool, {
    email: cleanEmail,
    phoneNumber: cleanPhone,
    excludeUserId: userId,
  });

  const res = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         phone_number = COALESCE($3, phone_number),
         gender = COALESCE($4, gender),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, full_name, email, phone_number, gender, role, department, status, organization_id`,
    [cleanName, cleanEmail, cleanPhone, gender, userId],
  );

  if (res.rows.length === 0) {
    throw new Error("User not found");
  }

  const updatedUser = res.rows[0];

  // Fetch organization name
  const orgRes = await pool.query(
    "SELECT name FROM organizations WHERE id = $1",
    [updatedUser.organization_id],
  );
  updatedUser.organization_name = orgRes.rows[0]?.name || "";

  // Generate fresh token with updated details
  const token = jwt.sign(
    {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      organization_id: updatedUser.organization_id,
      full_name: updatedUser.full_name,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  return {
    ...updatedUser,
    token,
  };
}

module.exports = {
  authenticateUser,
  getUserById,
  updateUserProfile,
  JWT_SECRET,
};
