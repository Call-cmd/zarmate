const db = require("../services/database.service");
const rapyd = require("../../common/rapyd-client");
const { provisionNewUserBonus } = require("../backgroundJobs"); // We'll move this function

const registerUser = async (req, res) => {
  try {
    // Get user-friendly details from the request body
    const { handle, whatsappNumber, email, firstName, lastName } = req.body;

    if (!handle || !whatsappNumber || !email) {
      return res
        .status(400)
        .json({ error: "handle, whatsappNumber, and email are required" });
    }

    // --- STEP 1: Create the user in the Rapyd API (the "bank") ---
    console.log(`Attempting to create user '${handle}' in Rapyd API...`);
    const rapydUserResponse = await rapyd.createUser({
      email,
      firstName: firstName || "ZarMate",
      lastName: lastName || "User",
    });

    // Extract the REAL, OFFICIAL IDs from the Rapyd response
    const officialUserId = rapydUserResponse.data.user.id;
    const officialPaymentId = rapydUserResponse.data.user.paymentIdentifier;
    console.log(`Rapyd user created successfully with ID: ${officialUserId}`);

    // --- STEP 2: Save the user to OUR database, linking the two systems ---
    await db.saveUser({
      id: officialUserId, // Use the ID from Rapyd as our primary key
      paymentIdentifier: officialPaymentId,
      handle: handle,
      whatsappNumber: whatsappNumber,
      email: email,
    });

    // --- STEP 3: Kick off the background job for gas and bonus ---
    provisionNewUserBonus(officialUserId, officialPaymentId);

    // --- STEP 4: Respond immediately ---
    res.status(202).json({
      message: "User registration successful. Welcome bonus is being processed.",
      userId: officialUserId,
      handle: handle,
    });
  } catch (error) {
    console.error("ERROR during user registration:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to register user." });
  }
};

module.exports = { registerUser };