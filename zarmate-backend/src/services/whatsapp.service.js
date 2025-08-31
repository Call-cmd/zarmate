// src/services/whatsapp.service.js

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client     = twilio(accountSid, authToken);

// MUST be in the Twilio/WhatsApp address format, e.g. "whatsapp:+14155238886"
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !twilioWhatsappNumber) {
  console.warn("Twilio env vars missing. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER.");
}

/**
 * to: must be "whatsapp:+<E.164 number>" e.g. "whatsapp:+27831234567"
 * message: string
 */
const sendMessage = async (to, message) => {
  console.log("--- SENDING WHATSAPP MESSAGE ---");
  console.log(`To: ${to}`);
  console.log(`From: ${twilioWhatsappNumber}`);
  console.log(`Message preview: ${message}`);
  console.log("---------------------------------");

  if (!to || !message) {
    throw new Error("sendMessage requires both 'to' and 'message' parameters.");
  }

  try {
    const msg = await client.messages.create({
      from: twilioWhatsappNumber, // e.g. "whatsapp:+14155238886"
      to: to,                     // e.g. "whatsapp:+27831234567"
      body: message
    });

    console.log("✅ WhatsApp message sent. SID:", msg.sid);
    return msg; // useful for tests / further handling
  } catch (error) {
    // log more detailed info for debugging
    console.error("❌ Error sending WhatsApp message via Twilio:", error.message || error);
    throw error; // rethrow if caller needs to handle it
  }
};

module.exports = { sendMessage };
