// ============================================================================
// Organization Service
// ============================================================================

const { pool } = require("../config/db");

async function getOrganizations() {
  const res = await pool.query("SELECT * FROM organizations ORDER BY name ASC");
  return res.rows;
}

async function getOrganizationById(id) {
  const res = await pool.query("SELECT * FROM organizations WHERE id = $1", [
    id,
  ]);
  if (res.rows.length === 0) {
    throw new Error("Organization not found");
  }
  return res.rows[0];
}

const {
  validateOrgName,
  validateEmail,
  validateLocationName,
} = require("../utils/validation");

async function createOrganization({
  name,
  industry,
  description,
  contact_email,
  business_type,
  district,
  sector,
  street_number,
  product_types,
}) {
  const cleanName = validateOrgName(name);
  const cleanDistrict = district
    ? validateLocationName(district, "District")
    : "";
  const cleanSector = sector ? validateLocationName(sector, "Sector") : "";
  const cleanEmail = contact_email ? validateEmail(contact_email, false) : "";

  const res = await pool.query(
    `INSERT INTO organizations (name, industry, description, contact_email, business_type, district, sector, street_number, product_types)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      cleanName,
      industry || "Financial & Enterprise Services",
      description || "",
      cleanEmail || "",
      business_type || "",
      cleanDistrict || "",
      cleanSector || "",
      street_number || "",
      product_types || "",
    ],
  );
  return res.rows[0];
}

async function updateOrganization(
  id,
  {
    name,
    industry,
    description,
    contact_email,
    business_type,
    district,
    sector,
    street_number,
    product_types,
  },
) {
  const cleanName = name ? validateOrgName(name) : null;
  const cleanDistrict = district
    ? validateLocationName(district, "District")
    : null;
  const cleanSector = sector ? validateLocationName(sector, "Sector") : null;
  const cleanEmail = contact_email ? validateEmail(contact_email, false) : null;

  const res = await pool.query(
    `UPDATE organizations 
     SET name = COALESCE($1, name),
         industry = COALESCE($2, industry),
         description = COALESCE($3, description),
         contact_email = COALESCE($4, contact_email),
         business_type = COALESCE($5, business_type),
         district = COALESCE($6, district),
         sector = COALESCE($7, sector),
         street_number = COALESCE($8, street_number),
         product_types = COALESCE($9, product_types),
         updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [
      cleanName,
      industry,
      description,
      cleanEmail,
      business_type,
      cleanDistrict,
      cleanSector,
      street_number,
      product_types,
      id,
    ],
  );
  if (res.rows.length === 0) {
    throw new Error("Organization not found");
  }
  return res.rows[0];
}

module.exports = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
};
