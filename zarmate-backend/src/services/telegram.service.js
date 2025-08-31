// src/services/telegram.service.js
const axios = require("axios");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN env var");
}

const api = axios.create({
  baseURL: `https://api.telegram.org/bot${botToken}`,
  timeout: 7000,
});

const sendMessage = async (chatId, text, options = {}) => {
  if (!chatId) throw new Error("sendMessage requires chatId");
  if (!text) throw new Error("sendMessage requires text");

  const payload = {
    chat_id: chatId,
    text,
    ...options, // e.g. { parse_mode: "MarkdownV2", disable_web_page_preview: true }
  };

  try {
    const res = await api.post("/sendMessage", payload);

    if (!res.data || res.data.ok === false) {
      // Telegram returned a controlled error
      const desc = res.data && res.data.description ? res.data.description : "Unknown Telegram error";
      throw new Error(`Telegram API error: ${desc}`);
    }

    console.log(`✅ Telegram message sent to ${chatId}. message_id=${res.data.result?.message_id}`);
    return res.data; // return for callers/tests
  } catch (err) {
    // Provide helpful logs for debugging
    const info = err.response ? err.response.data : err.message;
    console.error("❌ Error sending Telegram message:", info);
    throw err; // rethrow so caller can decide (or remove if you prefer swallow)
  }
};

module.exports = { sendMessage };
