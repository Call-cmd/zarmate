require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("ZarMate API is running");
});

app.listen(process.env.PORT, () =>
  console.log(`ZarMate backend running on port ${process.env.PORT}`)
);


const rapyd = require("../common/rapyd-client");
app.post("/test-flow", async (req, res) => {
  try {
    const user = await rapyd.createUser({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User"
    });

    const paymentId = user.data.paymentIdentifier;

    await rapyd.mintFunds({
      transactionAmount: 50,
      transactionRecipient: paymentId,
      transactionNotes: "Welcome bonus"
    });

    const balance = await rapyd.getBalance(user.data.id);

    res.json({
      userId: user.data.id,
      paymentIdentifier: paymentId,
      balance: balance.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
