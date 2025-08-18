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

app.post("/test-flow", async (req, res) => {
  try {
    // Generate a unique email address for each test run
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${uniqueEmail}`);

    const user = await rapyd.createUser({
      email: uniqueEmail, // <-- Use the unique email here
      firstName: "Test",
      lastName: "User",
    });

    const userId = user.data.id;
    const paymentId = user.data.paymentIdentifier;

    // enable gas for the new user right after creation
    await rapyd.enableGasForUser(userId);

    await rapyd.mintFunds({
      transactionAmount: 50,
      transactionRecipient: paymentId,
      transactionNotes: "Welcome bonus",
    });

    const balance = await rapyd.getBalance(userId);

    res.json({
      message: "User created, gas enabled, and funds minted successfully.",
      userId: userId,
      paymentIdentifier: paymentId,
      balance: balance.data,
    });
  } catch (err) {
    // Log the full error for better debugging on the server side
    console.error("ERROR in /test-flow:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`ZarMate backend running on port ${PORT}`)
);