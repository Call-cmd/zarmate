// A simple in-memory database for the hackathon
const db = {
  users: {}, // Store users by their ID
  charges: {}, // Store payment charges by their ID
};

// Maps to quickly find users
const maps = {
  whatsappToUserId: {}, // Maps a WhatsApp number to a User ID
  handleToUserId: {}, // Maps a handle like '@Lebo' to a User ID
};

// --- User Functions ---
const saveUser = (user) => {
  db.users[user.id] = user;
  // For now, let's assume a WhatsApp number and handle are part of the user object
  // In a real app, you'd get this upon registration.
  maps.whatsappToUserId[user.whatsappNumber] = user.id;
  maps.handleToUserId[user.handle] = user.id;
  console.log(`[DB] Saved user: ${user.id}`);
};

const findUserByWhatsapp = (whatsappNumber) => {
  const userId = maps.whatsappToUserId[whatsappNumber];
  return db.users[userId] || null;
};

const findUserByHandle = (handle) => {
  const userId = maps.handleToUserId[handle];
  return db.users[userId] || null;
};

// --- Charge Functions ---
const saveCharge = (charge) => {
  db.charges[charge.id] = charge;
  console.log(`[DB] Saved charge: ${charge.id}`);
};

const findChargeById = (chargeId) => {
  return db.charges[chargeId] || null;
};

module.exports = {
  saveUser,
  findUserByWhatsapp,
  findUserByHandle,
  saveCharge,
  findChargeById,
};