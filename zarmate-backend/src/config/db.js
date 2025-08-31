const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL database", err.stack);
  } else {
    console.log("✅ PostgreSQL database connected successfully.");
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};