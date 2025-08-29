const { v4: uuidv4 } = require("uuid");
const db = require("../services/database.service");

const createCharge = async (req, res) => {
  try {
    const { merchantId: merchantHandle, amount, notes } = req.body;

    if (!merchantHandle || !amount) {
      return res
        .status(400)
        .json({ error: "merchantId (handle) and amount are required" });
    }

    // --- NEW LOGIC ---
    // 1. Find the merchant in the users table using their handle.
    const merchant = await db.findUserByHandle(merchantHandle);

    // 2. Check if the merchant actually exists.
    if (!merchant) {
      return res
        .status(404) // 404 Not Found is the correct status code here
        .json({ error: `Merchant with handle '${merchantHandle}' not found.` });
    }
    // --- END NEW LOGIC ---

    const charge = {
      id: `charge_${uuidv4()}`,
      // 3. Use the merchant's actual primary key (merchant.id) for the foreign key.
      merchant_id: merchant.id,
      amount,
      notes: notes || "Campus Store Purchase",
    };

    await db.saveCharge(charge);

    console.log(
      `Charge created: ${charge.id} for R${amount} by merchant ${merchant.id}`
    );

    res.status(201).json({
      message: "Charge created successfully.",
      chargeId: charge.id,
      qrContent: `pay ${charge.id}`,
    });
  } catch (error) {
    console.error("ERROR creating charge:", error);
    res.status(500).json({ error: "Failed to create charge." });
  }
};

module.exports = { createCharge };