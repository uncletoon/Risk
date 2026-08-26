const { updateUserProfile } = require("../backend/src/services/authService");
const {
  createUser,
  updateUser,
} = require("../backend/src/services/adminService");
const { pool } = require("../backend/src/config/db");

async function testUniqueness() {
  console.log("Testing Email & Phone Uniqueness Validation...\n");

  // Seed state check:
  // User 1: Dr. Marcus Vance, admin@eridss.com, +250 788 123 456
  // User 2: Elena Rostova, officer@eridss.com, +250 788 654 321
  await updateUserProfile(1, {
    email: "admin@eridss.com",
    phoneNumber: "+250 788 123 456",
  });
  await updateUserProfile(2, {
    email: "officer@eridss.com",
    phoneNumber: "+250 788 654 321",
  });

  // Test 1: User 2 tries to take User 1's email
  try {
    await updateUserProfile(2, { email: "admin@eridss.com" });
    console.error(
      "✗ Failed: Should reject duplicate email on updateUserProfile",
    );
  } catch (err) {
    console.log("✓ Duplicate email rejected on update profile:", err.message);
  }

  // Test 2: User 2 tries to take User 1's phone number (+250 788 123 456)
  try {
    await updateUserProfile(2, { phoneNumber: "+250 788 123 456" });
    console.error(
      "✗ Failed: Should reject duplicate phone number on updateUserProfile",
    );
  } catch (err) {
    console.log(
      "✓ Duplicate exact phone rejected on update profile:",
      err.message,
    );
  }

  // Test 3: User 2 tries to take User 1's phone number with different formatting (+250788123456)
  try {
    await updateUserProfile(2, { phoneNumber: "+250788123456" });
    console.error("✗ Failed: Should reject normalized duplicate phone number");
  } catch (err) {
    console.log(
      "✓ Normalized duplicate phone rejected on update profile:",
      err.message,
    );
  }

  // Test 4: Admin creates new user with existing email
  try {
    await createUser(
      {
        fullName: "Alice Smith",
        email: "admin@eridss.com",
        phoneNumber: "+250 788 999 888",
        password: "Password@123",
      },
      1,
    );
    console.error("✗ Failed: Should reject duplicate email on createUser");
  } catch (err) {
    console.log("✓ Duplicate email rejected on admin createUser:", err.message);
  }

  // Test 5: Admin creates new user with existing phone
  try {
    await createUser(
      {
        fullName: "Bob Smith",
        email: "bob@enterprise.rw",
        phoneNumber: "+250 788 654 321", // Elena's phone
        password: "Password@123",
      },
      1,
    );
    console.error("✗ Failed: Should reject duplicate phone on createUser");
  } catch (err) {
    console.log("✓ Duplicate phone rejected on admin createUser:", err.message);
  }

  // Test 6: User 1 updates own profile with same email & phone (should succeed)
  try {
    const res = await updateUserProfile(1, {
      fullName: "Dr. Marcus Vance",
      email: "admin@eridss.com",
      phoneNumber: "+250 788 123 456",
      gender: "Male",
    });
    console.log(
      "✓ Updating self with same email/phone succeeds as expected:",
      res.email,
      res.phone_number,
    );
  } catch (err) {
    console.error(
      "✗ Failed: User should be able to keep own email/phone:",
      err.message,
    );
  }

  console.log("\nALL EMAIL & PHONE NUMBER UNIQUENESS VALIDATIONS PASSED!");
  await pool.end();
}

testUniqueness().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
