// telegram.controller.js - Webhook handler
const express = require('express');
const { sendMessage } = require('../services/telegram.service');

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
    const chatId = message?.chat?.id;
    const messageText = message?.text;
    const userId = message?.from?.id;
    const username = message?.from?.username;
    
    if (!chatId) {
      console.error("❌ No chat ID found in message");
      return res.status(200).send('OK');
    }

    console.log(`📩 Message from ${username || 'Unknown'} (${userId}): "${messageText}"`);

    // Respond to Telegram immediately to prevent timeout
    res.status(200).send('OK');

    // Process the message asynchronously (don't await here)
    processMessageAsync(chatId, messageText, userId, username)
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
const processMessageAsync = async (chatId, messageText, userId, username) => {
  try {
    // Add your bot logic here
    let responseMessage;
    
    if (messageText === '/start') {
      responseMessage = `Hello ${username || 'there'}! Welcome to the bot.`;
    } else if (messageText === '/help') {
      responseMessage = 'Here are the available commands:\n/start - Start the bot\n/help - Show this help';
    } else {
      responseMessage = `You said: "${messageText}". I'm processing this...`;
    }

    // Send response with retry logic (from your improved service)
    await sendMessage(chatId, responseMessage, {
      retries: 3,
      useAlternatives: true,
      runDiagnosticsOnFailure: false // Don't run diagnostics for each message
    });

  } catch (error) {
    console.error("❌ Error processing message:", error.message);
    
    // Try to send an error message to user (optional)
    try {
      await sendMessage(chatId, "Sorry, I'm having technical difficulties. Please try again later.", {
        retries: 1,
        useAlternatives: false,
        runDiagnosticsOnFailure: false
      });
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