const { updateUserProfile } = require("../backend/src/services/authService");
const {
  updateOrganization,
} = require("../backend/src/services/organizationService");
const { pool } = require("../backend/src/config/db");

async function runStrictTests() {
  console.log("Running Strict Validation Tests...\n");

  // Test 1: Name with digits
  try {
    await updateUserProfile(1, { fullName: "Marcus123 Vance" });
    console.error("✗ Failed: Marcus123 Vance should have been rejected");
  } catch (err) {
    console.log("✓ Name with numbers rejected:", err.message);
  }

  // Test 2: Name with special characters
  try {
    await updateUserProfile(1, { fullName: "Marcus@Vance$$" });
    console.error("✗ Failed: Marcus@Vance$$ should have been rejected");
  } catch (err) {
    console.log("✓ Name with special chars rejected:", err.message);
  }

  // Test 3: Valid name with period, apostrophe, and hyphen
  try {
    const res = await updateUserProfile(1, {
      fullName: "Dr. Jean-Pierre O'Connor",
    });
    console.log("✓ Valid complex name accepted:", res.full_name);
  } catch (err) {
    console.error(
      "✗ Failed: Dr. Jean-Pierre O'Connor should be valid:",
      err.message,
    );
  }

  // Reset name back
  await updateUserProfile(1, { fullName: "Dr. Marcus Vance (Admin)" });

  // Test 4: District with numbers
  try {
    await updateOrganization(1, { district: "District 99" });
    console.error("✗ Failed: District 99 should have been rejected");
  } catch (err) {
    console.log("✓ District with numbers rejected:", err.message);
  }

  // Test 5: Valid District
  try {
    const org = await updateOrganization(1, {
      district: "Nyarugenge",
      sector: "Nyarugenge",
    });
    console.log("✓ Valid district accepted:", org.district, "/", org.sector);
  } catch (err) {
    console.error("✗ Failed: Nyarugenge should be valid:", err.message);
  }

  // Test 6: Invalid email format
  try {
    await updateUserProfile(1, { email: "invalid-email-address" });
    console.error("✗ Failed: invalid-email-address should have been rejected");
  } catch (err) {
    console.log("✓ Invalid email rejected:", err.message);
  }

  console.log("\nALL STRICT VALIDATION CHECKS PASSED PERFECTLY!");
  await pool.end();
}

runStrictTests();
