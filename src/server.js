// Make sure this is the VERY FIRST line to load environment variables
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { saveUser } = require("./services/database.service"); // Import DB service

// --- Routers ---
const merchantRoutes = require("./api/merchants.routes");
const whatsappRoutes = require("./api/whatsapp.routes");



// --- DEBUGGING: Check if your environment variables are loaded ---
console.log("RAPYD_API_KEY:", process.env.RAPYD_API_KEY ? "Loaded" : "NOT FOUND");
console.log(
  "RAPYD_BASE_URL:",
  process.env.RAPYD_BASE_URL ? "Loaded" : "NOT FOUND"
);
// ----------------------------------------------------------------

const rapyd = require("../common/rapyd-client");

// --- API Routes ---
app.use("/api/merchants", merchantRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// --- Add Dummy Data for Testing ---
function setupTestData() {
  console.log("Setting up test data...");
  // Student 1: Sam
  saveUser({
    id: "user_sam_123", // This would come from the Rapyd API
    paymentIdentifier: "pid_sam_abc", // This would also come from Rapyd
    handle: "@sam",
    whatsappNumber: "27820000001", // Use your own number for testing
  });
  // Student 2: Lebo
  saveUser({
    id: "user_lebo_456",
    paymentIdentifier: "pid_lebo_def",
    handle: "@lebo",
    whatsappNumber: "27820000002",
  });
  // Merchant: Campus Cafe
  saveUser({
    id: "merchant_cafe_789",
    paymentIdentifier: "pid_cafe_ghi",
    handle: "@campuscafe",
    whatsappNumber: "27820000003",
  });
  console.log("Test data loaded.");
}


const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("ZarMate API is running");
});

// This endpoint seems fine as is, assuming it's a quick operation.
app.get("/check-business-balance", async (req, res) => {
  try {
    console.log("Checking business float/balance...");
    const balance = await rapyd.getBusinessFloat();
    res.json(balance.data);
  } catch (err) {
    console.error(
      "ERROR checking business balance:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: err.message });
  }
});

// This endpoint is also likely fine as is.
app.post("/fund-my-business", async (req, res) => {
  try {
    console.log("Attempting to fund the business wallet with gas...");
    const result = await rapyd.enableBusinessGas();
    console.log("Business wallet funding initiated.");
    res.json({
      message: "Request to fund business wallet sent successfully.",
      data: result.data,
    });
  } catch (err) {
    console.error(
      "ERROR funding business wallet:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: err.message });
  }
});

// Helper function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * This is our new background task function. It handles all the slow
 * operations after the user has been created.
 */
async function provisionNewUserBonus(userId, paymentId) {
  try {
    console.log(`[Background] Starting bonus provisioning for user: ${userId}`);

    await rapyd.enableGasForUser(userId);
    console.log(
      `[Background] Gas enabled for user: ${userId}. Waiting for funds to arrive...`
    );

    // Wait for 5 seconds to allow the gas transaction to complete on the backend
    await delay(5000);
    console.log(
      "[Background] 5 seconds have passed. Attempting to mint funds..."
    );

    await rapyd.mintFunds({
      transactionAmount: 50,
      transactionRecipient: paymentId,
      transactionNotes: "Welcome bonus",
    });
    console.log(`[Background] SUCCESS: 50 funds minted for user: ${userId}`);
    // Optional: Here you could trigger a WhatsApp notification to the user
    // telling them their bonus has arrived.
  } catch (error) {
    // CRITICAL: Log any errors that happen in the background
    console.error(
      `[Background] FAILED to provision bonus for user ${userId}:`,
      error.response ? error.response.data : error.message
    );
  }
}

// REVISED /test-flow endpoint
app.post("/test-flow", async (req, res) => {
  try {
    // --- STEP 1: Perform the quick, essential task ---
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${uniqueEmail}`);

    const user = await rapyd.createUser({
      email: uniqueEmail,
      firstName: "Test",
      lastName: "User",
    });

    const userId = user.data.user.id;
    const paymentId = user.data.user.paymentIdentifier;
    console.log(`User created with ID: ${userId}. Kicking off background job.`);

    // --- STEP 2: Kick off the slow tasks in the background ---
    // We call the function but DO NOT use 'await'. This lets the code
    // continue immediately to the next line without waiting.
    provisionNewUserBonus(userId, paymentId);

    // --- STEP 3: Respond to the client immediately ---
    // We use status 202 Accepted to indicate the request was received
    // and is being processed, but is not yet complete.
    res.status(202).json({
      message:
        "User creation initiated. Welcome bonus is being processed in the background.",
      userId: userId,
      paymentIdentifier: paymentId,
    });
  } catch (err) {
    // This will only catch errors from the 'createUser' step
    console.error(
      "ERROR in /test-flow (createUser step):",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ZarMate backend running on port ${PORT}`)
  setupTestData();
});