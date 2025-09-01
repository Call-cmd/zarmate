const rapyd = require("../../common/rapyd-client");
const db = require("../services/database.service");
const whatsapp = require("../services/whatsapp.service");

// Ensure the number has the proper prefix
function formatWhatsappNumber(num) {
  if (!num.startsWith("whatsapp:")) {
    return `whatsapp:${num}`;
  }
  return num;
}

async function executeTransfer(
  sender,
  recipient,
  amount,
  notes,
  chargeId = null
) {

  // --- NEW ROUND-UP LOGIC ---
  const originalAmount = amount;
  const roundedUpAmount = Math.ceil(originalAmount);
  const contribution = roundedUpAmount - originalAmount;
  // --- END NEW LOGIC ---


  try {
    console.log(
      `[Background] Original amount: R${originalAmount}, Rounded-up: R${roundedUpAmount}, Contribution: R${contribution.toFixed(2)}`
    );

    // We will now use the rounded-up amount for the main transfer
    const transferPayload = {
      transactionAmount: roundedUpAmount, // Charge the customer the full rounded-up amount
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


    // --- NEW: If there's a contribution, transfer it to the community fund ---
    if (contribution > 0) {
      console.log(`[Background] Transferring R${contribution.toFixed(2)} to Community Fund.`);
      // Find the community fund user in our database
      const communityFundUser = await db.findUserByHandle("@communityfund");
      if (communityFundUser) {
        // This is a "fire and forget" transfer from the MERCHANT to the FUND.
        // The merchant acts as a temporary holding account.
        await rapyd.transferFunds(recipient.id, {
          transactionAmount: contribution,
          transactionRecipient: communityFundUser.payment_identifier,
          transactionNotes: `Round-up from charge ${chargeId}`,
        });
        console.log("[Background] Contribution transfer successful.");
      }
    }
    // --- END NEW LOGIC ---
    

    if (chargeId) {
      console.log(`Updating status for charge ${chargeId} to COMPLETE.`);
      await rapyd.updateCharge(recipient.id, chargeId, {
        status: "COMPLETE",
      });
    }

    // Notify the user of the full amount they paid
    await whatsapp.sendMessage(
      formatWhatsappNumber(sender.whatsapp_number),
      `✅ Transfer complete! You paid R${roundedUpAmount.toFixed(2)} to ${recipient.handle}. Thank you for your R${contribution.toFixed(2)} contribution to the community fund!`
    );
    // The merchant is notified of the original amount
    await whatsapp.sendMessage(
      formatWhatsappNumber(recipient.whatsapp_number),
      `🎉 You received R${originalAmount.toFixed(2)} from ${sender.handle}!`
    );
  } catch (error) {
    console.error(
      `[Background] FAILED to transfer funds for charge ${chargeId}:`,
      error.response ? error.response.data : error.message
    );

    // --- THIS IS THE FIX ---
    await whatsapp.sendMessage(
      formatWhatsappNumber(sender.whatsapp_number)
      `❌ Your transfer of R${amount.toFixed(2)} failed. Please try again later.`
    );
  }
}

module.exports = { executeTransfer };