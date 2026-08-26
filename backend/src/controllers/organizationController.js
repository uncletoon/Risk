// ============================================================================
// Organization Controller
// ============================================================================

const {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
} = require("../services/organizationService");

const isUserAdmin = (user) => user?.role === "SYSTEM_ADMIN" || user?.role === "ADMIN";

const listOrganizations = async (req, res) => {
  try {
    if (isUserAdmin(req.user)) {
      const orgs = await getOrganizations();
      return res.json(orgs);
    }

    if (req.user?.organization_id) {
      const myOrg = await getOrganizationById(req.user.organization_id);
      return res.json([myOrg]);
    }

    res.json([]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch organizations", error: err.message });
  }
};

const getOrganization = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id, 10);
    if (!isUserAdmin(req.user) && req.user?.organization_id !== orgId) {
      return res.status(403).json({ message: "Forbidden: Access denied to other organizations" });
    }

    const org = await getOrganizationById(orgId);
    res.json(org);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const createOrg = async (req, res) => {
  try {
    const {
      name,
      industry,
      description,
      contact_email,
      business_type,
      district,
      sector,
      street_number,
      product_types,
    } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Organization name is required" });
    }
    const newOrg = await createOrganization({
      name,
      industry,
      description,
      contact_email,
      business_type,
      district,
      sector,
      street_number,
      product_types,
    });
    res.status(201).json(newOrg);
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || "Failed to create organization" });
  }
};

const updateOrg = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id, 10);
    if (!isUserAdmin(req.user) && req.user?.organization_id !== orgId) {
      return res.status(403).json({ message: "Forbidden: You cannot modify another organization's profile" });
    }

    const updated = await updateOrganization(orgId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  listOrganizations,
  getOrganization,
  createOrg,
  updateOrg,
};
