const express = require('express');
const { sendMessage } = require('../services/telegram.service'); // Fixed import
const db = require("../services/database.service");
const rapyd = require("../../common/rapyd-client");
const { executeTransfer } = require("./transaction.controller");

// Middleware to validate Telegram webhook
const validateTelegramWebhook = (req, res, next) => {
  try {
    // Basic validation
    if (!req.body || !req.body.message) {
      console.log("⚠️ Received webhook without message, ignoring");
      return res.status(200).send('OK'); // Always return 200 to Telegram
    }
    next();
  } catch (error) {
    console.error("❌ Webhook validation error:", error);
    res.status(200).send('OK'); // Still return 200 to prevent Telegram retries
  }
};

const handleIncomingMessage = async (req, res) => {
  try {
    console.log("📨 Received Telegram webhook:", JSON.stringify(req.body, null, 2));
    
    const { message } = req.body;
    
    // Extract message details safely
    const fromChatId = message?.chat?.id;
    const text = message?.text || "";
    const fromUserHandle = message?.from?.username;
    
    if (!fromChatId) {
      console.error("❌ No chat ID found in message");
      return res.status(200).send('OK');
    }

    console.log(`--- LIVE TELEGRAM MESSAGE ---`);
    console.log(`From: @${fromUserHandle} (Chat ID: ${fromChatId})`);
    console.log(`Body: ${text}`);
    console.log(`---------------------------`);

    // Respond to Telegram immediately to prevent timeout
    res.status(200).send('OK');

    // Process the message asynchronously (don't await here)
    processMessageAsync(fromChatId, text, fromUserHandle)
      .catch(error => {
        console.error("❌ Error processing message async:", error.message);
      });

  } catch (error) {
    console.error("❌ Error in webhook handler:", error.message);
    console.error("Stack:", error.stack);
    
    // Always return 200 to Telegram to prevent retries
    res.status(200).send('OK');
  }
};

// Process message without blocking the webhook response
const processMessageAsync = async (fromChatId, text, fromUserHandle) => {
  try {
    // We need a way to link telegram username to our user.
    // For the demo, we can assume the telegram handle matches the ZarMate handle.
    const sender = await db.findUserByHandle(`@${fromUserHandle}`);

    if (!sender) {
      await sendMessage(fromChatId, "Sorry, your Telegram handle is not registered with ZarMate.");
      return;
    }

    // Now, all your existing logic works perfectly.
    const msg = text.trim();
    const lowerCaseText = text.trim().toLowerCase();

    // BALANCE CHECK
    if (lowerCaseText === "balance" || lowerCaseText === "bal") {
      try {
        console.log(`Fetching balance for user: ${sender.id}`);
        
        let balance = 0; // Always declare with a default value.
    
        const balanceResponse = await rapyd.getBalance(sender.id);
        const tokens = balanceResponse?.data?.tokens;
    
        if (tokens && Array.isArray(tokens) && tokens.length > 0) {
          // Find the specific token with the correct name
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
        await sendMessage(fromChatId, reply);
    
      } catch (error) {
        console.error(`Failed to fetch balance for user ${sender.id}:`, error);
        await sendMessage(
          fromChatId,
          "Sorry, I couldn't fetch your balance right now. Please try again later."
        );
      }
      return;
    }

    // TRANSACTION HISTORY
    if (lowerCaseText === "history" || lowerCaseText === "transactions") {
      try {
        console.log(`Fetching transaction history for user: ${sender.id}`);
        const response = await rapyd.getTransactions(sender.id);
        const transactions = response?.data?.transactions ?? [];

        if (transactions.length === 0) {
          await sendMessage(fromChatId, "You have no transactions yet.");
          return;
        }

        // Format a user-friendly list of the last 5 transactions
        let reply = "Your recent transactions:\n\n";
        transactions
          .slice(0, 5) // Get the 5 most recent transactions
          .forEach((tx) => {
            const date = new Date(tx.createdAt).toLocaleDateString("en-ZA");
            const amount = parseFloat(tx.value).toFixed(2);
            
            // Create a simple description based on transaction type
            let description = "";
            switch (tx.txType.toUpperCase()) {
              case "DEBIT":
                description = `➡️ Sent R${amount}`;
                break;
              case "CREDIT":
                description = `⬅️ Received R${amount}`;
                break;
              case "MINT":
                description = `🎉 Bonus Received R${amount}`;
                break;
              default:
                description = `${tx.txType} R${amount}`;
            }
            reply += `${description} on ${date}\n`;
          });

        await sendMessage(fromChatId, reply);
      } catch (error) {
        console.error(`Failed to fetch history for user ${sender.id}:`, error);
        await sendMessage(
          fromChatId,
          "Sorry, I couldn't fetch your transaction history right now."
        );
      }
      return;
    }

    // COUPON CLAIM
    const claimMatch = lowerCaseText.match(/^(claim|redeem)\s+([\w-]+)/i);
    if (claimMatch) {
      const couponCode = claimMatch[2].toUpperCase();

      try {
        console.log(`User ${sender.id} attempting to claim coupon code: ${couponCode}`);
        await sendMessage(fromChatId, `Checking code ${couponCode}...`);

        // 1. Get all available coupons (this part works and proves the coupon is real)
        const couponsResponse = await rapyd.getAllCoupons();
        const allCoupons = couponsResponse.data;
        const targetCoupon = allCoupons.find(c => c.code.toUpperCase() === couponCode);

        if (!targetCoupon) {
          await sendMessage(fromChatId, `Sorry, the coupon code "${couponCode}" is not valid.`);
          return;
        }

        // --- DEMO MODE WORKAROUND ---
        // The API's claim endpoint is bugged. We will simulate the claim
        // by minting a reward directly to the user's account.
        console.log(`Found coupon ID ${targetCoupon.id}. Simulating successful claim...`);

        // The API doesn't specify a coupon value, so we'll hardcode one for the demo.
        const couponValue = 10.00;

        await rapyd.mintFunds({
          transactionAmount: couponValue,
          transactionRecipient: sender.payment_identifier,
          transactionNotes: `Reward for claiming coupon: ${targetCoupon.code}`,
        });

        console.log(`Successfully minted R${couponValue} reward for user ${sender.id}`);
        await sendMessage(fromChatId, `✅ Success! You have claimed the "${targetCoupon.title}" coupon. R${couponValue.toFixed(2)} has been added to your balance.`);
        // --- END OF WORKAROUND ---

      } catch (error) {
        console.error(`Failed to claim coupon for user ${sender.id}:`, error.response ? error.response.data : error);
        const errorMessage = "An unexpected error occurred while claiming your coupon.";
        await sendMessage(fromChatId, `❌ Claim failed. ${errorMessage}`);
      }
      return;
    }

    // USER-TO-USER TRANSFER: "send R50 to @lebo"
    const transferMatch = msg.match(/^send\s+r?(\d+(\.\d{1,2})?)\s+to\s+(@\w+)/);
    if (transferMatch) {
      const amount = parseFloat(transferMatch[1]);
      const recipientHandle = transferMatch[3];
      const recipient = await db.findUserByHandle(recipientHandle);

      if (!recipient) {
        await sendMessage(fromChatId, `Sorry, I couldn't find user ${recipientHandle}.`);
        return;
      }

      // Respond immediately and start the job in the background
      await sendMessage(fromChatId, `Processing your transfer of R${amount} to ${recipient.handle}...`);
      executeTransfer(sender, recipient, amount, `Transfer from ${sender.handle}`);
      return;
    }

    // QR CODE PAYMENT: "pay charge_12345"
    const paymentMatch = msg.match(/^pay\s+([\w-]+)/i);
    if (paymentMatch) {
      const chargeId = paymentMatch[1];

      try {
        // --- STEP 1: VALIDATE THE CHARGE WITH RAPYD API ---
        console.log(`Validating charge ID: ${chargeId}`);
        const chargeResponse = await rapyd.getCharge(chargeId);

        const charge = chargeResponse?.data?.charge; // The charge object from Rapyd

        if (!charge || charge.status !== "PENDING") {
          await sendMessage(
            fromChatId,
            "Sorry, that payment code is invalid or has already been paid."
          );
          return;
        }

        // We have a valid, pending charge. Now find the merchant.
        const merchant = await db.findUserById(charge.userId);
        if (!merchant) {
          // This is an internal error, the merchant should always exist
          console.error(`Could not find merchant with ID: ${charge.userId}`);
          await sendMessage(fromChatId, "Sorry, an error occurred with the merchant's account.");
          return;
        }

        // --- STEP 2: EXECUTE THE TRANSFER (already uses Rapyd API) ---
        await sendMessage(
          fromChatId,
          `Processing your payment of R${charge.amount} for "${charge.note}"...`
        );

        // We need to pass the merchant object to the background job
        // so we can update the charge status later.
        executeTransfer(sender, merchant, charge.amount, charge.note, charge.id);

        return;
      } catch (error) {
        console.error("Error during payment processing:", error.response ? error.response.data : error);
        if (error.response && error.response.status === 404) {
          await sendMessage(fromChatId, "Sorry, that payment code is invalid.");
        } else {
          await sendMessage(fromChatId, "Sorry, an error occurred while processing your payment.");
        }
        return;
      }
    }

    // Default response if no command is matched
    await sendMessage(fromChatId, "Sorry, I didn't understand that. Try 'send R50 to @handle' or 'balance'.");

  } catch (error) {
    console.error("❌ Error processing message:", error.message);
    
    // Try to send an error message to user (optional)
    try {
      await sendMessage(fromChatId, "Sorry, I'm having technical difficulties. Please try again later.");
    } catch (sendError) {
      console.error("❌ Failed to send error message:", sendError.message);
    }
  }
};

// Route setup
const router = express.Router();

// Webhook endpoint
router.post('/webhook', 
  express.json({ limit: '10mb' }), // Parse JSON body
  validateTelegramWebhook,
  handleIncomingMessage
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'telegram-webhook'
  });
});

// Test endpoint to check webhook setup
router.get('/webhook-info', async (req, res) => {
  try {
    const axios = require('axios');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    res.json({
      webhookInfo: response.data.result,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;