const rapyd = require("../../common/rapyd-client");
const db = require("../services/database.service");
const whatsapp = require("../services/whatsapp.service");

/**
 * The actual background job that performs a transfer and sends notifications.
 */
async function executeTransfer(
  sender,
  recipient,
  amount,
  notes,
  chargeId = null
) {
  try {
    console.log(
      `[Background] Executing transfer of R${amount} from ${sender.id} to ${recipient.id}`
    );

    // The actual API call to the blockchain service
    await rapyd.transferFunds(sender.id, {
      transactionAmount: amount,
      transactionRecipient: recipient.paymentIdentifier,
      transactionNotes: notes,
    });

    console.log(`[Background] Transfer successful!`);

    // Update the charge status if this is a QR payment
    if (chargeId) {
      const charge = await db.findChargeById(chargeId);
      if (charge) {
        await db.updateChargeStatus(chargeId, "COMPLETED");
      }
    }

    // Send success notifications
    await whatsapp.sendMessage(
      sender.whatsappNumber,
      `✅ Transfer complete! You sent R${amount} to ${recipient.handle}.`
    );
    await whatsapp.sendMessage(
      recipient.whatsappNumber,
      `🎉 You received R${amount} from ${sender.handle}!`
    );
  } catch (error) {
    console.error(
      `[Background] FAILED to transfer funds for charge ${chargeId}:`,
      error.response ? error.response.data : error.message
    );
    await whatsapp.sendMessage(
      sender.whatsappNumber,
      `❌ Your transfer of R${amount} failed. Please try again later.`
    );
  }
}

module.exports = { executeTransfer };