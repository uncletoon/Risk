const {
  authenticateUser,
  getUserById,
  updateUserProfile,
} = require("../backend/src/services/authService");
const {
  getOrganizations,
  updateOrganization,
} = require("../backend/src/services/organizationService");
const {
  getUsers,
  createUser,
  updateUser,
} = require("../backend/src/services/adminService");
const { pool } = require("../backend/src/config/db");

async function testAll() {
  console.log("Testing User and Organization updates...");

  // 1. Test updateUserProfile
  const updatedUser = await updateUserProfile(1, {
    fullName: "Dr. Marcus Vance (Admin)",
    email: "admin@eridss.com",
    phoneNumber: "+250 788 111 222",
    gender: "Male",
  });
  console.log("✓ updateUserProfile result:", {
    id: updatedUser.id,
    full_name: updatedUser.full_name,
    email: updatedUser.email,
    phone_number: updatedUser.phone_number,
    gender: updatedUser.gender,
    token: Boolean(updatedUser.token),
  });

  // 2. Test getUserById
  const fetchedUser = await getUserById(1);
  console.log("✓ getUserById result:", {
    id: fetchedUser.id,
    full_name: fetchedUser.full_name,
    email: fetchedUser.email,
    phone_number: fetchedUser.phone_number,
    gender: fetchedUser.gender,
  });

  // 3. Test updateOrganization
  const updatedOrg = await updateOrganization(1, {
    name: "MONEY KABUHARIWE",
    industry: "Financial & Enterprise Services",
    business_type: "Microfinance & Digital Credit",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    street_number: "KN 4 Ave, Plot 12",
    product_types:
      "Digital Micro-Loans, SME Working Capital, Savings & Group Guarantees",
    description:
      "Multinational conglomerate operating in digital financial infrastructure, logistics, and cloud platforms.",
    contact_email: "info@moneykakubayeho.com",
  });
  console.log("✓ updateOrganization result:", {
    id: updatedOrg.id,
    name: updatedOrg.name,
    business_type: updatedOrg.business_type,
    district: updatedOrg.district,
    sector: updatedOrg.sector,
    street_number: updatedOrg.street_number,
    product_types: updatedOrg.product_types,
  });

  // 4. Test admin getUsers
  const allUsers = await getUsers();
  console.log("✓ admin getUsers total:", allUsers.length, "Sample user:", {
    id: allUsers[0].id,
    name: allUsers[0].full_name,
    phone: allUsers[0].phone_number,
    gender: allUsers[0].gender,
  });

  console.log("ALL TESTS PASSED SUCCESSFULLY!");
  await pool.end();
}

testAll().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
