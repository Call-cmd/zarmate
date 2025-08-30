const db = require("../services/database.service");
const whatsapp = require("../services/whatsapp.service");
const rapyd = require("../../common/rapyd-client");
const { executeTransfer } = require("./transaction.controller");

const handleIncomingMessage = async (req, res) => {
  // Assuming the webhook payload looks like: { from: '27821234567', text: '...' }
  const { from, text } = req.body;
  const message = text.trim();

  const sender = await db.findUserByWhatsapp(from);
  if (!sender) {
    // We can now safely send a message back if the user isn't found
    await whatsapp.sendMessage(from, "Sorry, your number is not registered.");
    return res.status(404).json({ error: "User not found" });
  }

  // --- NEW: BALANCE CHECK ENDPOINT ---
if (message === "balance" || message === "bal") {
  try {
    console.log(`Fetching balance for user: ${sender.id}`);
    
    let balance = 0; // Always declare with a default value.

    const balanceResponse = await rapyd.getBalance(sender.id);
    const tokens = balanceResponse?.data?.tokens;

    if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      // --- THIS IS THE FIX ---
      // We are now looking for the exact name from the API response.
      const zarToken = tokens.find(
        (token) => token.name && token.name.toUpperCase() === "L ZAR COIN"
      );

      // If the token is found, update the balance.
      if (zarToken && zarToken.balance) {
        // The API sends the balance as a string ("39.0"), so we must parse it.
        balance = parseFloat(zarToken.balance);
      }
    }

    const reply = `Your current ZarMate balance is R${balance.toFixed(2)}.`;
    await whatsapp.sendMessage(from, reply);

  } catch (error) {
    console.error(`Failed to fetch balance for user ${sender.id}:`, error);
    await whatsapp.sendMessage(
      from,
      "Sorry, I couldn't fetch your balance right now. Please try again later."
    );
  }
  return res.status(200).send("OK");
}

  // --- Command Routing ---

  // 1. User-to-User Transfer: "send R50 to @lebo"
  const transferMatch = message.match(/^send\s+r?(\d+(\.\d{1,2})?)\s+to\s+(@\w+)/);
  if (transferMatch) {
    const amount = parseFloat(transferMatch[1]);
    const recipientHandle = transferMatch[3];
    const recipient = db.findUserByHandle(recipientHandle);

    if (!recipient) {
      await whatsapp.sendMessage(from, `Sorry, I couldn't find user ${recipientHandle}.`);
      return res.status(200).send("OK");
    }

    // Respond immediately and start the job in the background
    await whatsapp.sendMessage(from, `Processing your transfer of R${amount} to ${recipient.handle}...`);
    executeTransfer(sender, recipient, amount, `Transfer from ${sender.handle}`);
    return res.status(200).send("OK");
  }

  // 2. QR Code Payment: "pay charge_12345"
  const paymentMatch = message.match(/^pay\s+([\w-]+)/i); // Simplified regex
  if (paymentMatch) {
    const chargeId = paymentMatch[1];

    try {
      // --- STEP 1: VALIDATE THE CHARGE WITH RAPYD API ---
      console.log(`Validating charge ID: ${chargeId}`);
      const chargeResponse = await rapyd.getCharge(chargeId);

      // --- ADD THIS CRITICAL DEBUGGING LOG ---
      //console.log("Full Rapyd GetCharge Response:",JSON.stringify(chargeResponse.data, null, 2));
      // -----------------------------------------

      const charge = chargeResponse?.data?.charge; // The charge object from Rapyd

      if (!charge || charge.status !== "PENDING") {
        await whatsapp.sendMessage(
          from,
          "Sorry, that payment code is invalid or has already been paid."
        );
        return res.status(200).send("OK");
      }

      // We have a valid, pending charge. Now find the merchant.
      const merchant = await db.findUserById(charge.userId);
      if (!merchant) {
        // This is an internal error, the merchant should always exist
        console.error(`Could not find merchant with ID: ${charge.userId}`);
        await whatsapp.sendMessage(from, "Sorry, an error occurred with the merchant's account.");
        return res.status(200).send("OK");
      }

      // --- STEP 2: EXECUTE THE TRANSFER (already uses Rapyd API) ---
      await whatsapp.sendMessage(
        from,
        `Processing your payment of R${charge.amount} for "${charge.note}"...`
      );

      // We need to pass the merchant object to the background job
      // so we can update the charge status later.
      executeTransfer(sender, merchant, charge.amount, charge.note, charge.id);

      return res.status(200).send("OK");
    } catch (error) {
      console.error("Error during payment processing:", error.response ? error.response.data : error);
      if (error.response && error.response.status === 404) {
        await whatsapp.sendMessage(from, "Sorry, that payment code is invalid.");
      } else {
        await whatsapp.sendMessage(from, "Sorry, an error occurred while processing your payment.");
      }
      return res.status(200).send("OK");
    }
  }

  // Default response if no command is matched
  await whatsapp.sendMessage(from, "Sorry, I didn't understand that. Try 'send R50 to @handle' or 'balance'.");
  res.status(200).send("OK");
};

module.exports = { handleIncomingMessage };