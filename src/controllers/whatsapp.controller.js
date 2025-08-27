const db = require("../../services/database.service");
const whatsapp = require("../../services/whatsapp.service");
const { executeTransfer } = require("./transaction.controller");

const handleIncomingMessage = async (req, res) => {
  // Assuming the webhook payload looks like: { from: '27821234567', text: '...' }
  const { from, text } = req.body;
  const message = text.trim().toLowerCase();

  const sender = db.findUserByWhatsapp(from);
  if (!sender) {
    return res.status(404).json({ error: "User not found" });
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
  const paymentMatch = message.match(/^pay\s+(charge_\w+-?\w+)/);
  if (paymentMatch) {
    const chargeId = paymentMatch[1];
    const charge = db.findChargeById(chargeId);

    if (!charge || charge.status !== "PENDING") {
      await whatsapp.sendMessage(from, "Sorry, that payment code is invalid or has already been used.");
      return res.status(200).send("OK");
    }

    const merchant = db.findUserByHandle(charge.merchantId); // Assuming merchantId is their handle
    if (!merchant) {
      await whatsapp.sendMessage(from, "Sorry, the merchant for this payment could not be found.");
      return res.status(200).send("OK");
    }

    // Respond immediately and start the job in the background
    await whatsapp.sendMessage(from, `Processing your payment of R${charge.amount} for "${charge.notes}"...`);
    executeTransfer(sender, merchant, charge.amount, charge.notes, charge.id);
    return res.status(200).send("OK");
  }

  // Default response if no command is matched
  await whatsapp.sendMessage(from, "Sorry, I didn't understand that. Try 'send R50 to @handle' or 'balance'.");
  res.status(200).send("OK");
};

module.exports = { handleIncomingMessage };