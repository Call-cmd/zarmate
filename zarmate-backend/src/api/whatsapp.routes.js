const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsapp.controller");

// The single endpoint for all incoming messages from WhatsApp
router.post("/webhook", whatsappController.handleIncomingMessage);

module.exports = router;