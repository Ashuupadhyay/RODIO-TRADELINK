const request = require("supertest");
const app = require("./app"); // Aapki main app.js file का path

describe("🔥 PRODUCTION LEVEL API TESTING: /api/auth/register", () => {

  // =========================================================================
  // 1. HAPPY PATH (VALID INPUT DATA)
  // =========================================================================
  describe("✅ Success Scenarios", () => {
    test("Pass Scenario: Valid data se registration successful hona chahiye", async () => {
      const validPayload = {
        email: `testuser_${Date.now()}@example.com`, // Unique Email
        password: "Password@123",
        role: "user"
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(validPayload);

      expect(res.statusCode).toBe(201); // Created Status
      expect(res.body).toHaveProperty("success", true);
    });
  });

  // =========================================================================
  // 2. MULTIPLE FAILED INPUT DATA TEST CASES (MATRIX)
  // =========================================================================
  describe("❌ Validation & Failed Data Point Scenarios", () => {

    // Har tarah ke wrong inputs ka combination array me daala gaya hai
    const failedCases = [
      {
        testName: "Empty Payload Data",
        payload: {},
        expectedStatus: 400
      },
      {
        testName: "Missing Password",
        payload: { email: "user@test.com", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Missing Email",
        payload: { password: "Password@123", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Invalid Email Format (Without @/domain)",
        payload: { email: "invalid-email-string", password: "Password@123", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Weak/Short Password (< 6 chars)",
        payload: { email: "user@test.com", password: "123", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Invalid Role (Not allowed in Schema)",
        payload: { email: "user@test.com", password: "Password@123", role: "superadmin" },
        expectedStatus: 400
      },
      {
        testName: "Data Type Mismatch (Number in Email)",
        payload: { email: 987654321, password: "Password@123", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Empty String / Blank Spaces",
        payload: { email: "   ", password: "   ", role: "user" },
        expectedStatus: 400
      },
      {
        testName: "Null Value in Required Fields",
        payload: { email: null, password: null, role: "user" },
        expectedStatus: 400
      }
    ];

    // Loop chala ke har input data point ko test kiya jayega
    failedCases.forEach(({ testName, payload, expectedStatus }) => {
      test(`Failed Case: ${testName}`, async () => {
        const res = await request(app)
          .post("/api/auth/register")
          .send(payload);

        // 🔍 AGAR TEST FAIL HUA (Yaani API ne unexpected status return kiya):
        if (res.statusCode !== expectedStatus) {
          console.log("\n🚨 ==============================================");
          console.log(`❌ FAILED TEST SCENARIO : ${testName}`);
          console.log("📥 EXACT INPUT DATA OBJECT:", JSON.stringify(payload, null, 2));
          console.log(`🎯 EXPECTED STATUS CODE  : ${expectedStatus}`);
          console.log(`⚡ RECEIVED STATUS CODE  : ${res.statusCode}`);
          console.log("💬 SERVER ERROR RESPONSE :", res.body);
          console.log("============================================== 🚨\n");
        }

        expect(res.statusCode).toBe(expectedStatus);
      });
    });
  });

  // =========================================================================
  // 3. DATABASE & SECURITY EDGE CASES
  // =========================================================================
  describe("🛡️ Database & Security Edge Cases", () => {
    
    test("Security Attack: NoSQL Query Injection payload check", async () => {
      const nosqlInjectionPayload = {
        email: { "$gt": "" }, // Hacker Attempt
        password: "Password@123",
        role: "user"
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(nosqlInjectionPayload);

      // System crash (500) nahi hona chahiye, Validation error (400) aana chahiye
      expect(res.statusCode).toBe(400);
    });

    test("Security Attack: Extra unwanted fields (isAdmin: true)", async () => {
      const extraFieldPayload = {
        email: `sec_${Date.now()}@test.com`,
        password: "Password@123",
        role: "user",
        isAdmin: true // Unauthorized privilege escalation
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(extraFieldPayload);

      // Field inject nahi honi chahiye
      if (res.body && res.body.user) {
        expect(res.body.user.isAdmin).not.toBe(true);
      }
    });

  });

});