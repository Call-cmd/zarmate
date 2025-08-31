const twilio = require("twilio");

// Initialize the Twilio client with your credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Sends a real WhatsApp message using the Twilio API.
 * @param {string} to - The recipient's full WhatsApp number (e.g., 'whatsapp:+27786280415')
 * @param {string} message - The text message to send.
 */
const sendMessage = async (to, message) => {
  console.log("--- SENDING REAL WHATSAPP MESSAGE ---");
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log("---------------------------------");

  try {
    await client.messages.create({
      from: `whatsapp:${twilioWhatsappNumber}`, // Your Twilio Sandbox number
      to: to, // The user's number (already includes the 'whatsapp:' prefix)
      body: message,
    });
    console.log("✅ WhatsApp message sent successfully via Twilio.");
  } catch (error) {
    console.error("❌ Error sending WhatsApp message via Twilio:", error);
  }
};

module.exports = { sendMessage };