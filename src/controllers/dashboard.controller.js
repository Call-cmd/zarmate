const db = require("../services/database.service");
const rapyd = require("../../common/rapyd-client");

// --- Endpoint for the Overview Stats ---
const getOverviewStats = async (req, res) => {
  try {
    const { merchantId } = req.params;

    // 1. Get LZAR Balance from Rapyd API
    const balancePromise = rapyd.getBalance(merchantId);
    const statsPromise = db.getMerchantDashboardStats(merchantId);

    const [balanceResponse, dbStats] = await Promise.all([
      balancePromise,
      statsPromise,
    ]);

    // Start with a default balance of 0
    //let lzarBalance = 0;
    const tokens = balanceResponse?.data?.tokens;

    // Check if the tokens array exists and has items
    if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      // Find the specific token with the correct name
      const zarToken = tokens.find(
        (token) => token.name && token.name.toUpperCase() === "L ZAR COIN"
      );

      // If found, parse its balance string into a number
      if (zarToken && zarToken.balance) {
        lzarBalance = parseFloat(zarToken.balance);
      }
    }

    res.json({
      lzarBalance: lzarBalance,
      pendingSettlement: parseFloat(dbStats.pending_settlement) || 0,
      totalTransactions: parseInt(dbStats.total_transactions, 10) || 0,
      uniqueCustomers: parseInt(dbStats.unique_customers, 10) || 0,
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ error: "Failed to fetch overview stats" });
  }
};

// --- Endpoint for the Transactions Tab ---
const getMerchantTransactions = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const transactions = await db.getTransactionsForMerchant(merchantId);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// --- Endpoint for the Customers Tab ---
const getMerchantCustomers = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const customers = await db.getCustomersForMerchant(merchantId);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching merchant customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

module.exports = {
  getOverviewStats,
  getMerchantTransactions,
  getMerchantCustomers,
};