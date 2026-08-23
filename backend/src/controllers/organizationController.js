// ============================================================================
// Organization Controller
// ============================================================================

const {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
} = require('../services/organizationService');

const listOrganizations = async (req, res) => {
  try {
    const orgs = await getOrganizations();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch organizations', error: err.message });
  }
};

const getOrganization = async (req, res) => {
  try {
    const org = await getOrganizationById(req.params.id);
    res.json(org);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const createOrg = async (req, res) => {
  try {
    const { name, industry, description, contact_email } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }
    const newOrg = await createOrganization({ name, industry, description, contact_email });
    res.status(201).json(newOrg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create organization', error: err.message });
  }
};

const updateOrg = async (req, res) => {
  try {
    const updated = await updateOrganization(req.params.id, req.body);
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
