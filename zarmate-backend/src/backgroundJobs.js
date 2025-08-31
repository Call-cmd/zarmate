const rapyd = require("../common/rapyd-client");

// Helper function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * This is our background task function. It handles all the slow
 * operations after the user has been created.
 */
async function provisionNewUserBonus(userId, paymentId) {
  try {
    console.log(`[Background] Starting bonus provisioning for user: ${userId}`);
    await rapyd.enableGasForUser(userId);
    console.log(`[Background] Gas enabled for user: ${userId}. Waiting...`);
    await delay(10000);
    console.log("[Background] Attempting to mint funds...");
    await rapyd.mintFunds({
      transactionAmount: 50,
      transactionRecipient: paymentId,
      transactionNotes: "Welcome bonus",
    });
    console.log(`[Background] SUCCESS: 50 funds minted for user: ${userId}`);
  } catch (error) {
    console.error(
      `[Background] FAILED to provision bonus for user ${userId}:`,
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = { provisionNewUserBonus };