const db = require("../services/database.service");
const rapyd = require("../../common/rapyd-client");

const createCharge = async (req, res) => {
  try {
    const { merchantId: merchantHandle, amount, notes } = req.body;

    if (!merchantHandle || !amount) {
      return res
        .status(400)
        .json({ error: "merchantId (handle) and amount are required" });
    }

    const merchant = await db.findUserByHandle(merchantHandle);
    if (!merchant) {
      return res
        .status(404)
        .json({ error: `Merchant with handle '${merchantHandle}' not found.` });
    }

    const chargePayload = {
      paymentId: merchant.payment_identifier,
      amount: amount,
      note: notes,
    };

    const chargeResponse = await rapyd.createCharge(merchant.id, chargePayload);

    // --- THIS IS THE FIX ---
    // The Postman test proved the ID is at chargeResponse.data.charge.id
    const chargeId = chargeResponse?.data?.charge?.id;

    if (!chargeId) {
      console.error(
        "ERROR: Rapyd API did not return a charge ID in the expected format.",
        JSON.stringify(chargeResponse.data)
      );
      return res
        .status(500)
        .json({ error: "Failed to create charge: API response was invalid." });
    }

    console.log(`Rapyd charge created: ${chargeId} for R${amount}`);

    res.status(201).json({
      message: "Charge created successfully.",
      chargeId: chargeId,
      qrContent: `pay ${chargeId}`,
    });
  } catch (error) {
    console.error(
      "ERROR creating charge:",
      error.response ? error.response.data : error
    );
    res.status(500).json({ error: "Failed to create charge." });
  }
};

module.exports = { createCharge };