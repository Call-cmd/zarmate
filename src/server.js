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
