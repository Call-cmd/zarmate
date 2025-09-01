// src/services/telegram.service.js
const axios = require("axios");

// Ensure the bot token is loaded
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Add retry logic and better error handling
const sendMessage = async (chatId, text, options = {}) => {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set in environment variables!");
    throw new Error("Telegram bot token not configured");
  }

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Sending Telegram message (attempt ${attempt}/${maxRetries}) to chat ${chatId}`);
      
      const response = await axios.post(
        `${TELEGRAM_API_URL}/sendMessage`,
        {
          chat_id: chatId,
          text: text,
          parse_mode: options.parse_mode || "HTML",
          ...options
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          },
          // In production, you might want to handle SSL differently
          // Only use this for debugging SSL issues:
          // httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
      );

      console.log(`Telegram message sent successfully to chat ${chatId}`);
      return response.data;
      
    } catch (error) {
      lastError = error;
      
      // Log detailed error information
      if (error.code === 'ECONNREFUSED') {
        console.error(`Connection refused to Telegram API (attempt ${attempt}/${maxRetries})`);
      } else if (error.code === 'ETIMEDOUT') {
        console.error(`Timeout connecting to Telegram API (attempt ${attempt}/${maxRetries})`);
      } else if (error.response) {
        // The request was made and the server responded with an error
        console.error(`Telegram API error (attempt ${attempt}/${maxRetries}):`, {
          status: error.response.status,
          data: error.response.data
        });
        
        // Don't retry on client errors (4xx)
        if (error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`No response from Telegram API (attempt ${attempt}/${maxRetries}):`, error.message);
      } else {
        // Something else happened
        console.error(`Telegram service error (attempt ${attempt}/${maxRetries}):`, error.message);
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error("Failed to send Telegram message after all retries:", lastError);
  throw lastError;
};

// Function to test Telegram connection
const testConnection = async () => {
  try {
    console.log("Testing Telegram bot connection...");
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`, {
      timeout: 5000
    });
    console.log("Telegram bot connected successfully:", response.data.result);
    return response.data.result;
  } catch (error) {
    console.error("Failed to connect to Telegram bot:", error.message);
    throw error;
  }
};

// Function to set webhook (if needed)
const setWebhook = async (webhookUrl) => {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
      url: webhookUrl
    });
    console.log("Webhook set successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to set webhook:", error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  testConnection,
  setWebhook
};