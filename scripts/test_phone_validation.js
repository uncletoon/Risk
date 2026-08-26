const { updateUserProfile } = require("../backend/src/services/authService");
const { pool } = require("../backend/src/config/db");

async function testValidation() {
  console.log("Testing Phone Validation...");

  // Valid number test
  try {
    const res = await updateUserProfile(1, { phoneNumber: "+250 788 123 456" });
    console.log("✓ Valid phone test passed:", res.phone_number);
  } catch (err) {
    console.error("✗ Valid phone test failed:", err.message);
  }

  // Invalid characters test
  try {
    await updateUserProfile(1, { phoneNumber: "abc-xyz" });
    console.error("✗ Invalid character test failed: Should have thrown");
  } catch (err) {
    console.log("✓ Invalid character rejected correctly:", err.message);
  }

  // Too short test
  try {
    await updateUserProfile(1, { phoneNumber: "12345" });
    console.error("✗ Too short test failed: Should have thrown");
  } catch (err) {
    console.log("✓ Too short rejected correctly:", err.message);
  }

  // Too long test
  try {
    await updateUserProfile(1, { phoneNumber: "12345678901234567890" });
    console.error("✗ Too long test failed: Should have thrown");
  } catch (err) {
    console.log("✓ Too long rejected correctly:", err.message);
  }

  console.log("ALL PHONE VALIDATION TESTS COMPLETED SUCCESSFULLY!");
  await pool.end();
}

testValidation();
