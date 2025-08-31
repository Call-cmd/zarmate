require("dotenv").config();
const axios = require("axios");

const client = axios.create({
  baseURL: process.env.RAPYD_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.RAPYD_API_KEY}`,
    "Content-Type": "application/json"
  }
});

async function checkFloatBalance() {
  try {
    const res = await client.get("/float");
    const floatBalance = res.data?.balance || 0;

    console.log(`💰 Float Balance: ${floatBalance} ZAR`);

    if (floatBalance <= 0) {
      console.warn("⚠️ You have no funds in your float wallet! Ask the organizers to top it up before minting.");
      return false;
    }

    console.log("✅ You have funds — you can mint!");
    return true;
  } catch (err) {
    console.error("❌ Error checking float balance:", err.response?.data || err.message);
    return false;
  }
}

async function main() {
  const canMint = await checkFloatBalance();
  if (!canMint) return;

  // Example: Try minting if float has funds
  const mintPayload = {
    transactionAmount: 50,
    transactionRecipient: "hHK61kO5OM7zzwyFb4oS", // Replace with user’s paymentIdentifier
    transactionNotes: "Welcome bonus"
  };

  try {
    const mintRes = await client.post("/mint", mintPayload);
    console.log("✅ Mint successful:", mintRes.data);
  } catch (err) {
    console.error("❌ Mint failed:", err.response?.data || err.message);
  }
}

main();
