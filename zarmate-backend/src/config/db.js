const { Pool } = require("pg");

// 1. Create a configuration object.
const dbConfig = {};

// 2. Check if we are in a production environment (like DigitalOcean).
if (process.env.NODE_ENV === "production") {
  // If so, the ONLY thing we need is the connection string.
  dbConfig.connectionString = process.env.DATABASE_URL;
  // Add SSL configuration required for most cloud databases.
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
} else {
  // If we are in development, use the local .env variables.
  dbConfig.user = process.env.DB_USER;
  dbConfig.host = process.env.DB_HOST;
  dbConfig.database = process.env.DB_DATABASE;
  dbConfig.password = process.env.DB_PASSWORD;
  dbConfig.port = process.env.DB_PORT;
}

// 3. Create the pool using the correct configuration.
const pool = new Pool(dbConfig);

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