const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchant.controller");

// Endpoint for a merchant's device to create a payment request
router.post("/charges", merchantController.createCharge);

module.exports = router;