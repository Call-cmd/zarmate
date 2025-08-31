
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// This variable should just be the number, e.g., "+14155238886"
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const sendMessage = async (to, message) => {
  console.log("--- SENDING REAL WHATSAPP MESSAGE ---");
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log("---------------------------------");

  try {
    await client.messages.create({
      // --- THIS IS THE FIX ---
      // The 'from' number should NOT have the 'whatsapp:' prefix.
      from: twilioWhatsappNumber,

      // The 'to' number correctly uses the full address from Twilio.
      to: to,
      body: message,
    });
    console.log("✅ WhatsApp message sent successfully via Twilio.");
  } catch (error) {
    console.error("❌ Error sending WhatsApp message via Twilio:", error);
  }
};

module.exports = { sendMessage };