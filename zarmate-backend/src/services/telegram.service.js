const axios = require("axios");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

// Create axios instance with timeout configuration
const telegramAPI = axios.create({
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendMessage = async (chatId, message, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Attempting to send Telegram message (attempt ${attempt}/${retries})`);
      
      const response = await telegramAPI.post(`${telegramApiUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });

      if (response.data.ok) {
        console.log(`✅ Telegram message sent successfully to chat ID: ${chatId}`);
        return response.data;
      } else {
        console.error(`❌ Telegram API returned error: ${response.data.description}`);
        throw new Error(`Telegram API error: ${response.data.description}`);
      }
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isTimeoutError = error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED';
      
      console.error(`❌ Error sending Telegram message (attempt ${attempt}/${retries}):`, error.message);
      
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
        
        // Don't retry for certain HTTP errors
        if (error.response.status === 400 || error.response.status === 401 || error.response.status === 403) {
          throw error;
        }
      }
      
      if (isLastAttempt) {
        console.error(`❌ Failed to send Telegram message after ${retries} attempts`);
        throw error;
      }
      
      if (isTimeoutError) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(`⏳ Timeout error, retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      } else {
        // For other errors, wait a shorter time
        await delay(1000);
      }
    }
  }
};

// Alternative method with manual timeout handling
const sendMessageWithManualTimeout = async (chatId, message, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await axios.post(`${telegramApiUrl}/sendMessage`, {
      chat_id: chatId,
      text: message,
    }, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.data.ok) {
      console.log(`✅ Telegram message sent successfully to chat ID: ${chatId}`);
      return response.data;
    } else {
      console.error(`❌ Telegram API returned error: ${response.data.description}`);
      throw new Error(`Telegram API error: ${response.data.description}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    
    console.error("❌ Error sending Telegram message:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    throw error;
  }
};

// Health check function to test connectivity
const testConnection = async () => {
  try {
    const response = await telegramAPI.get(`${telegramApiUrl}/getMe`);
    if (response.data.ok) {
      console.log("✅ Telegram Bot API connection successful");
      console.log(`Bot info: ${response.data.result.first_name} (@${response.data.result.username})`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Failed to connect to Telegram API:", error.message);
    return false;
  }
};

module.exports = { 
  sendMessage, 
  sendMessageWithManualTimeout, 
  testConnection 
};