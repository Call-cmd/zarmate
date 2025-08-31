const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegram.controller");

// This will be the single endpoint for all incoming messages from Telegram
router.post("/webhook", telegramController.handleIncomingMessage);

module.exports = router;