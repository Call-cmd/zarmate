const axios = require("axios");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

const sendMessage = async (chatId, message) => {
  try {
    await axios.post(`${telegramApiUrl}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });
    console.log(`✅ Telegram message sent successfully to chat ID: ${chatId}`);
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error.response ? error.response.data : error.message);
  }
};

module.exports = { sendMessage };