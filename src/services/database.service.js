const db = require("../config/db");

/**
 * Creates the necessary tables if they don't already exist.
 * This function should be called once when the server starts.
 */
const initializeDatabase = async () => {
  try {
    // Create the 'users' table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        payment_identifier VARCHAR(255) NOT NULL,
        handle VARCHAR(50) UNIQUE NOT NULL,
        whatsapp_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create the 'charges' table
    await db.query(`
      CREATE TABLE IF NOT EXISTS charges (
        id VARCHAR(255) PRIMARY KEY,
        merchant_id VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (merchant_id) REFERENCES users(id)
      );
    `);
    console.log("✅ Database tables checked/created successfully.");
  } catch (error) {
    console.error("❌ Error initializing database tables:", error);
  }
};

/**
 * Saves or updates a user. Uses INSERT ON CONFLICT for an "upsert" operation.
 */
const saveUser = async (user) => {
  const { id, paymentIdentifier, handle, whatsappNumber } = user;
  const query = `
    INSERT INTO users (id, payment_identifier, handle, whatsapp_number)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET
      payment_identifier = EXCLUDED.payment_identifier,
      handle = EXCLUDED.handle,
      whatsapp_number = EXCLUDED.whatsapp_number;
  `;
  // Using parameterized queries ($1, $2) prevents SQL injection attacks.
  await db.query(query, [id, paymentIdentifier, handle, whatsappNumber]);
  console.log(`[DB] Saved user: ${handle}`);
};

const findUserByWhatsapp = async (whatsappNumber) => {
  const res = await db.query("SELECT * FROM users WHERE whatsapp_number = $1", [
    whatsappNumber,
  ]);
  return res.rows[0] || null;
};

const findUserByHandle = async (handle) => {
  const res = await db.query("SELECT * FROM users WHERE handle = $1", [handle]);
  return res.rows[0] || null;
};

const findUserById = async (userId) => {
  const res = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  return res.rows[0] || null;
};

const saveCharge = async (charge) => {
  const { id, merchant_id, amount, notes } = charge;
  const query = `
    INSERT INTO charges (id, merchant_id, amount, notes)
    VALUES ($1, $2, $3, $4);
  `;
  await db.query(query, [id, merchant_id, amount, notes]);
  console.log(`[DB] Saved charge: ${id}`);
};

const findChargeById = async (chargeId) => {
  const res = await db.query("SELECT * FROM charges WHERE id = $1", [chargeId]);
  return res.rows[0] || null;
};

// We need a new function to update the status of a charge
const updateChargeStatus = async (chargeId, status) => {
  await db.query("UPDATE charges SET status = $1 WHERE id = $2", [
    status,
    chargeId,
  ]);
  console.log(`[DB] Updated charge ${chargeId} status to ${status}`);
};

module.exports = {
  initializeDatabase,
  saveUser,
  findUserByWhatsapp,
  findUserByHandle,
  findUserById,
  saveCharge,
  findChargeById,
  updateChargeStatus,
};