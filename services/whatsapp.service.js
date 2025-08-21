// In a real app, this would integrate with an API like Twilio
const sendMessage = async (toWhatsappNumber, message) => {
  console.log("---------------------------------");
  console.log(`📲 SIMULATING WHATSAPP MESSAGE`);
  console.log(`TO: ${toWhatsappNumber}`);
  console.log(`MESSAGE: ${message}`);
  console.log("---------------------------------");
  // Pretend it takes a moment to send
  return new Promise((resolve) => setTimeout(resolve, 500));
};

module.exports = { sendMessage };