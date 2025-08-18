// Make sure this is the VERY FIRST line to load environment variables
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

// --- DEBUGGING: Check if your environment variables are loaded ---
console.log("RAPYD_API_KEY:", process.env.RAPYD_API_KEY);
console.log("RAPYD_BASE_URL:", process.env.RAPYD_BASE_URL);
// If either of these is 'undefined', your .env file is the problem.
// ----------------------------------------------------------------

const rapyd = require("../common/rapyd-client");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("ZarMate API is running");
});

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

app.post("/test-flow", async (req, res) => {
  try {
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${uniqueEmail}`);

    const user = await rapyd.createUser({
      email: uniqueEmail,
      firstName: "Test",
      lastName: "User",
    });

    const userId = user.data.user.id;
    const paymentId = user.data.user.paymentIdentifier;
    console.log(`User created with ID: ${userId}`);

    await rapyd.enableGasForUser(userId);
    console.log(`Gas enabled for user: ${userId}. Waiting for funds to arrive...`);

    
    // Wait for 10 seconds to allow the gas transaction to complete on the backend
    await delay(10000);
    console.log("10 seconds have passed. Attempting to mint funds...");
    // --------------------

    await rapyd.mintFunds({
      transactionAmount: 50,
      transactionRecipient: paymentId,
      transactionNotes: "Welcome bonus",
    });
    console.log(`50 funds minted for user: ${userId}`);

    const balance = await rapyd.getBalance(userId);

    res.json({
      message: "User created, gas enabled, and funds minted successfully.",
      userId: userId,
      paymentIdentifier: paymentId,
      balance: balance.data,
    });
  } catch (err) {
    console.error(
      "ERROR in /test-flow:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`ZarMate backend running on port ${PORT}`)
);