// ============================================================================
// System Admin Service
// Manages users, risk categories, deterministic rules, and governance
// ============================================================================

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { logAudit } = require("./auditService");

// --- Users Management ---

async function getUsers() {
  const res = await pool.query(
    `SELECT u.id, u.organization_id, u.full_name, u.email, u.phone_number, u.gender, u.role, u.department, u.status, u.created_at,
            o.name as organization_name
     FROM users u
     LEFT JOIN organizations o ON u.organization_id = o.id
     ORDER BY u.created_at DESC`,
  );
  return res.rows;
}

const {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  checkUserUniqueness,
} = require("../utils/validation");

async function createUser(payload, adminUserId) {
  const {
    organizationId,
    organization_id,
    fullName,
    full_name,
    email,
    password,
    role,
    department,
    phoneNumber,
    phone_number,
    gender,
  } = payload;

  const orgId = organizationId || organization_id || 1;
  const name = validateFullName(fullName || full_name);
  const cleanEmail = validateEmail(email, true);
  const phone = validatePhoneNumber(phoneNumber || phone_number);

  // Check email and phone uniqueness across users
  await checkUserUniqueness(pool, {
    email: cleanEmail,
    phoneNumber: phone,
  });

  const hashedPassword = await bcrypt.hash(password || "Officer@123", 10);

  const res = await pool.query(
    `INSERT INTO users (organization_id, full_name, email, password, phone_number, gender, role, department, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
     RETURNING id, organization_id, full_name, email, phone_number, gender, role, department, status, created_at`,
    [
      orgId,
      name,
      cleanEmail,
      hashedPassword,
      phone,
      gender || null,
      role || "RISK_OFFICER",
      department || "Risk Management",
    ],
  );

  const newUser = res.rows[0];
  await logAudit(adminUserId, orgId, "USER_CREATED", "users", newUser.id, {
    email: cleanEmail,
    role,
  });
  return newUser;
}

async function updateUser(userId, payload, adminUserId) {
  const {
    fullName,
    full_name,
    email,
    role,
    department,
    status,
    organizationId,
    organization_id,
    phoneNumber,
    phone_number,
    gender,
  } = payload;

  const name =
    fullName || full_name ? validateFullName(fullName || full_name) : null;
  const cleanEmail = email ? validateEmail(email, true) : null;
  const orgId = organizationId || organization_id;
  const phone =
    phoneNumber !== undefined || phone_number !== undefined
      ? validatePhoneNumber(phoneNumber || phone_number)
      : null;

  // Check email and phone uniqueness excluding current user
  await checkUserUniqueness(pool, {
    email: cleanEmail,
    phoneNumber: phone,
    excludeUserId: userId,
  });

  const res = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         department = COALESCE($4, department),
         status = COALESCE($5, status),
         organization_id = COALESCE($6, organization_id),
         phone_number = COALESCE($7, phone_number),
         gender = COALESCE($8, gender),
         updated_at = NOW()
     WHERE id = $9
     RETURNING id, organization_id, full_name, email, phone_number, gender, role, department, status, updated_at`,
    [name, cleanEmail, role, department, status, orgId, phone, gender, userId],
  );
  if (res.rows.length === 0) throw new Error("User not found");
  await logAudit(adminUserId, null, "USER_UPDATED", "users", userId, {
    role,
    status,
  });
  return res.rows[0];
}

// --- Categories Management ---

async function getCategories() {
  const res = await pool.query(
    "SELECT * FROM risk_categories ORDER BY code ASC",
  );
  return res.rows;
}

async function updateCategoryWeightsBatch(weightsArray, adminUserId) {
  if (!Array.isArray(weightsArray) || weightsArray.length === 0) {
    throw new Error(
      "Invalid weights payload: expected an array of category weights.",
    );
  }

  // Calculate sum of provided weights
  const totalWeight = weightsArray.reduce(
    (sum, item) =>
      sum + (parseFloat(item.defaultWeight || item.default_weight) || 0),
    0,
  );

  if (Math.abs(totalWeight - 100) > 0.05) {
    throw new Error(
      `Mathematical Governance Violation: Total category weights must sum to exactly 100.0%. Current sum is ${totalWeight.toFixed(2)}%.`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updatedCategories = [];
    for (const item of weightsArray) {
      const code = item.code;
      const weight = parseFloat(item.defaultWeight || item.default_weight);

      const res = await client.query(
        `UPDATE risk_categories
         SET default_weight = $1, updated_at = NOW()
         WHERE code = $2
         RETURNING *`,
        [weight, code],
      );
      if (res.rows.length > 0) {
        updatedCategories.push(res.rows[0]);
      }
    }

    await client.query("COMMIT");

    await logAudit(
      adminUserId,
      null,
      "CATEGORY_WEIGHTS_BATCH_UPDATED",
      "risk_categories",
      null,
      {
        weights: weightsArray.map((w) => ({
          code: w.code,
          weight: parseFloat(w.defaultWeight || w.default_weight),
        })),
        totalWeight: Number(totalWeight.toFixed(2)),
      },
    );

    return updatedCategories;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function updateCategoryWeight(code, defaultWeight, adminUserId) {
  const parsedWeight = parseFloat(defaultWeight);
  if (isNaN(parsedWeight) || parsedWeight < 0 || parsedWeight > 100) {
    throw new Error(
      "Default weight must be a valid percentage between 0 and 100.",
    );
  }

  // Check what the new total weight across all active categories would be
  const otherCatsRes = await pool.query(
    "SELECT code, default_weight FROM risk_categories WHERE code != $1 AND is_active = true",
    [code],
  );
  const otherSum = otherCatsRes.rows.reduce(
    (sum, r) => sum + parseFloat(r.default_weight),
    0,
  );
  const newTotal = otherSum + parsedWeight;

  if (Math.abs(newTotal - 100) > 0.05) {
    throw new Error(
      `Mathematical Governance Violation: Updating category '${code}' to ${parsedWeight}% would result in a total weight of ${newTotal.toFixed(2)}% (must equal exactly 100.0%). Please update category weights using the balanced batch update.`,
    );
  }

  const res = await pool.query(
    `UPDATE risk_categories
     SET default_weight = $1, updated_at = NOW()
     WHERE code = $2
     RETURNING *`,
    [parsedWeight, code],
  );
  if (res.rows.length === 0) throw new Error("Category not found");
  await logAudit(
    adminUserId,
    null,
    "CATEGORY_WEIGHT_UPDATED",
    "risk_categories",
    null,
    { code, defaultWeight: parsedWeight },
  );
  return res.rows[0];
}

// --- Risk Rules Management ---

async function getRules() {
  const res = await pool.query(
    `SELECT r.*, c.name as category_name
     FROM risk_rules r
     JOIN risk_categories c ON r.category_code = c.code
     ORDER BY r.category_code ASC, r.id ASC`,
  );
  return res.rows;
}

async function createRule(
  {
    categoryCode,
    factorName,
    conditionOperator,
    thresholdValue,
    likelihoodScore,
    impactScore,
    severity,
    description,
  },
  adminUserId,
) {
  const cleanFactor = (factorName || "").trim();
  const cleanThreshold = (thresholdValue || "").trim();

  if (!cleanFactor) {
    throw new Error("Risk factor name is required.");
  }

  // Conflict & Duplicate Detection
  const duplicateCheck = await pool.query(
    `SELECT id, factor_name, condition_operator, threshold_value 
     FROM risk_rules 
     WHERE category_code = $1 
       AND LOWER(TRIM(factor_name)) = LOWER($2) 
       AND condition_operator = $3 
       AND LOWER(TRIM(threshold_value)) = LOWER($4)`,
    [categoryCode, cleanFactor, conditionOperator, cleanThreshold],
  );

  if (duplicateCheck.rows.length > 0) {
    throw new Error(
      `Governance Conflict: A deterministic rule for category '${categoryCode}' with factor '${cleanFactor}' and condition '${conditionOperator} ${cleanThreshold}' already exists (Rule #${duplicateCheck.rows[0].id}).`,
    );
  }

  const res = await pool.query(
    `INSERT INTO risk_rules (category_code, factor_name, condition_operator, threshold_value, likelihood_score, impact_score, severity, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      categoryCode,
      cleanFactor,
      conditionOperator,
      cleanThreshold,
      likelihoodScore,
      impactScore,
      severity || "Moderate",
      description || "",
    ],
  );
  const rule = res.rows[0];
  await logAudit(adminUserId, null, "RULE_CREATED", "risk_rules", rule.id, {
    factorName: cleanFactor,
    thresholdValue: cleanThreshold,
  });
  return rule;
}

async function updateRule(ruleId, updates, adminUserId) {
  const {
    category_code,
    factor_name,
    condition_operator,
    threshold_value,
    likelihood_score,
    impact_score,
    severity,
    description,
    is_active,
  } = updates;

  if (factor_name || condition_operator || threshold_value || category_code) {
    // Conflict Check against other existing rules
    const currentRuleRes = await pool.query(
      "SELECT * FROM risk_rules WHERE id = $1",
      [ruleId],
    );
    if (currentRuleRes.rows.length === 0) throw new Error("Rule not found");
    const current = currentRuleRes.rows[0];

    const checkCategory = category_code || current.category_code;
    const checkFactor = (factor_name || current.factor_name).trim();
    const checkOperator = condition_operator || current.condition_operator;
    const checkThreshold = (threshold_value || current.threshold_value).trim();

    const duplicateCheck = await pool.query(
      `SELECT id FROM risk_rules 
       WHERE id != $1 
         AND category_code = $2 
         AND LOWER(TRIM(factor_name)) = LOWER($3) 
         AND condition_operator = $4 
         AND LOWER(TRIM(threshold_value)) = LOWER($5)`,
      [ruleId, checkCategory, checkFactor, checkOperator, checkThreshold],
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error(
        `Governance Conflict: Another rule (#${duplicateCheck.rows[0].id}) already defines '${checkFactor}' with '${checkOperator} ${checkThreshold}' in category '${checkCategory}'.`,
      );
    }
  }

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
    [
      category_code,
      factor_name,
      condition_operator,
      threshold_value,
      likelihood_score,
      impact_score,
      severity,
      description,
      is_active,
      ruleId,
    ],
  );
  if (res.rows.length === 0) throw new Error("Rule not found");
  await logAudit(
    adminUserId,
    null,
    "RULE_UPDATED",
    "risk_rules",
    ruleId,
    updates,
  );
  return res.rows[0];
}

async function deleteRule(ruleId, adminUserId) {
  await pool.query("DELETE FROM risk_rules WHERE id = $1", [ruleId]);
  await logAudit(adminUserId, null, "RULE_DELETED", "risk_rules", ruleId, {});
  return { success: true };
}

// --- System Metrics & Health ---

async function getSystemHealth() {
  const [
    usersCount,
    orgsCount,
    assessmentsCount,
    docsCount,
    risksCount,
    mitigationsCount,
    rulesCount,
  ] = await Promise.all([
    pool.query("SELECT count(*) FROM users"),
    pool.query("SELECT count(*) FROM organizations"),
    pool.query("SELECT count(*) FROM assessments"),
    pool.query("SELECT count(*) FROM documents"),
    pool.query("SELECT count(*) FROM identified_risks"),
    pool.query("SELECT count(*) FROM mitigation_actions"),
    pool.query("SELECT count(*) FROM risk_rules"),
  ]);

  return {
    status: "HEALTHY",
    database: "PostgreSQL Connected",
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
  updateCategoryWeightsBatch,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getSystemHealth,
};
