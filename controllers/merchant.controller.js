const { v4: uuidv4 } = require("uuid"); // Install with `npm install uuid`
const db = require("../services/database.service");

const createCharge = (req, res) => {
  const { merchantId, amount, notes } = req.body;

  if (!merchantId || !amount) {
    return res
      .status(400)
      .json({ error: "merchantId and amount are required" });
  }

  const charge = {
    id: `charge_${uuidv4()}`,
    merchantId,
    amount,
    notes: notes || "Campus Store Purchase",
    status: "PENDING", // Status can be PENDING, COMPLETED, FAILED
    createdAt: new Date().toISOString(),
  };

  db.saveCharge(charge);

  console.log(`Charge created: ${charge.id} for R${amount}`);

  // The merchant's terminal would turn this ID into a QR code
  res.status(201).json({
    message: "Charge created successfully.",
    chargeId: charge.id,
    qrContent: `pay ${charge.id}`, // This is what the QR code should contain
  });
};

module.exports = { createCharge };