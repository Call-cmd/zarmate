// src/server.js

// Make sure this is the VERY FIRST line to load environment variables
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./services/database.service");

const { setDefaultResultOrder } = require("node:dns");
setDefaultResultOrder("ipv4first");

// --- Routers ---
const merchantRoutes = require("./api/merchants.routes");
const whatsappRoutes = require("./api/whatsapp.routes");
const userRoutes = require("./api/users.routes");
const dashboardRoutes = require("./api/dashboard.routes");
const authRoutes = require("./api/auth.routes");
const telegramRoutes = require("./api/telegram.routes");

console.log("RAPYD_API_KEY:", process.env.RAPYD_API_KEY ? "Loaded" : "NOT FOUND");
console.log(
  "RAPYD_BASE_URL:",
  process.env.RAPYD_BASE_URL ? "Loaded" : "NOT FOUND"
);

console.log(
  "TELEGRAM_BOT_TOKEN:",
  process.env.TELEGRAM_BOT_TOKEN ? 
    `Loaded (starts with ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 5)}...` +
    `${process.env.TELEGRAM_BOT_TOKEN.substring(process.env.TELEGRAM_BOT_TOKEN.length - 5)})` : 
    "NOT FOUND"
);

// 1. CREATE THE EXPRESS APP INSTANCE
const app = express();

// 2. APPLY MIDDLEWARE
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// 3. DEFINE API ROUTES
app.use("/api/merchants", merchantRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/telegram", telegramRoutes);

// 4. DEFINE A SIMPLE TOP-LEVEL ROUTE for health checks
app.get("/", (req, res) => {
  res.send("ZarMate API is running!");
});

// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`ZarMate backend running on port ${PORT}`);
  await initializeDatabase();
  console.log("Database initialized. Ready for new user registrations.");
});