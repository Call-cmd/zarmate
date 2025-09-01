const axios = require("axios");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

const sendMessage = async (chatId, message) => {
  try {
    const response = await axios.post(`${telegramApiUrl}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });

    if (response.data.ok) {
      console.log(`✅ Telegram message sent successfully to chat ID: ${chatId}`);
      return response.data;
    }
    console.error(`❌ Telegram API returned error: ${response.data.description}`);
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${error.response.data}`);
    }
    throw error;
  }
};

module.exports = { sendMessage };