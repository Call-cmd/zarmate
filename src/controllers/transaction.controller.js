const rapyd = require("../../common/rapyd-client");
const db = require("../services/database.service");
const whatsapp = require("../services/whatsapp.service");

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

    const transferPayload = {
      transactionAmount: amount,
      transactionRecipient: recipient.payment_identifier,
      transactionNotes: notes,
    };

    const transferResponse = await rapyd.transferFunds(
      sender.id,
      transferPayload
    );

    console.log(
      "Full Rapyd Transfer Response:",
      JSON.stringify(transferResponse.data, null, 2)
    );

    // Check the blockchain receipt status for definitive success
    if (transferResponse?.data?.receipt?.status !== 1) {
      // If status is not 1, the transaction failed on-chain.
      throw new Error("Blockchain transaction failed.");
    }

    console.log("[Background] Blockchain transaction confirmed successful.");

    if (chargeId) {
      console.log(`Updating status for charge ${chargeId} to COMPLETE.`);
      await rapyd.updateCharge(recipient.id, chargeId, {
        status: "COMPLETE",
      });
    }

    await whatsapp.sendMessage(
      sender.whatsapp_number,
      `✅ Transfer complete! You sent R${amount.toFixed(2)} to ${recipient.handle}.`
    );
    await whatsapp.sendMessage(
      recipient.whatsapp_number,
      `🎉 You received R${amount.toFixed(2)} from ${sender.handle}!`
    );
  } catch (error) {
    console.error(
      `[Background] FAILED to transfer funds for charge ${chargeId}:`,
      error.response ? error.response.data : error.message
    );

    // --- THIS IS THE FIX ---
    await whatsapp.sendMessage(
      sender.whatsapp_number,
      `❌ Your transfer of R${amount.toFixed(2)} failed. Please try again later.`
    );
  }
}

module.exports = { executeTransfer };