const db = require("../services/database.service");
const jwt = require("jsonwebtoken");
const rapyd = require("../../common/rapyd-client");

const login = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Identifier is required" });
    }

    console.log(`Attempting to find user in Rapyd API with identifier: ${identifier}`);
    const rapydUserResponse = await rapyd.findRecipient(identifier);
    const user = rapydUserResponse.data; // The user object from Rapyd

    if (!user) {
      // This case should ideally not be hit if the API returns a 404,
      // but it's a good safeguard.
      return res.status(404).json({ error: "User not found. Please sign up." });
    }

    // We need to get the user's handle from our database, as Rapyd doesn't store it.
    const localUser = await db.findUserById(user.id);
    const handle = localUser ? localUser.handle : user.email; // Fallback to email if not in DB

    // User found, create a JWT
    const payload = {
      userId: user.id,
      handle: handle,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        handle: handle,
      },
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "User not found. Please sign up." });
    }
    console.error("Login error:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { login };