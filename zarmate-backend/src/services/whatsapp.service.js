const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Example: "whatsapp:+14155238886"
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const sendMessage = async (to, message) => {
  console.log("--- SENDING REAL WHATSAPP MESSAGE ---");
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log("---------------------------------");

  try {
    await client.messages.create({
      from: `whatsapp:${twilioWhatsappNumber}`,  // ✅ must have prefix
      to: `whatsapp:${to}`,                      // ✅ must have prefix
      body: message,
    });
    console.log("✅ WhatsApp message sent successfully via Twilio.");
  } catch (error) {
    console.error("❌ Error sending WhatsApp message via Twilio:", error);
  }
};

module.exports = { sendMessage };
