const db = require("../services/database.service");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Identifier is required" });
    }

    let user;
    // Check if identifier is an email or a WhatsApp number
    if (identifier.includes("@")) {
      user = await db.findUserByEmail(identifier);
    } else {
      user = await db.findUserByWhatsapp(identifier);
    }

    if (!user) {
      return res.status(404).json({ error: "User not found. Please sign up." });
    }

    // User found, create a JWT
    const payload = {
      userId: user.id,
      handle: user.handle,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        handle: user.handle,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { login };