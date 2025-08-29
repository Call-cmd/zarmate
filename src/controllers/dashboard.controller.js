const db = require("../services/database.service");
const rapyd = require("../../common/rapyd-client");

// --- Endpoint for the Overview Stats ---
const getOverviewStats = async (req, res) => {
  try {
    const { merchantId } = req.params;

    // 1. Get LZAR Balance from Rapyd API
    const balancePromise = rapyd.getBalance(merchantId);

    // 2. Get aggregated stats from our database
    const statsPromise = db.getMerchantDashboardStats(merchantId);

    const [balanceResponse, dbStats] = await Promise.all([
      balancePromise,
      statsPromise,
    ]);

    res.json({
      lzarBalance: balanceResponse.data.balance || 0,
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