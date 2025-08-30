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

const getCommunityFundBalance = async (req, res) => {
  try {
    const communityFundUser = await db.findUserByHandle("@communityfund");
    if (!communityFundUser) {
      return res.status(404).json({ error: "Community fund user not found." });
    }
    const balanceResponse = await rapyd.getBalance(communityFundUser.id);
    const tokens = balanceResponse?.data?.tokens;
    let balance = 0;
    if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      const zarToken = tokens.find(
        (token) => token.name && token.name.toUpperCase() === "L ZAR COIN"
      );
      if (zarToken && zarToken.balance) {
        balance = parseFloat(zarToken.balance);
      }
    }
    res.json({ balance });
  } catch (error) {
    console.error("Error fetching community fund balance:", error);
    res.status(500).json({ error: "Failed to fetch community fund balance" });
  }
};

const createMerchantCoupon = async (req, res) => {
  try {
    const { merchantId } = req.params;
    // The body will contain title, description, code, etc.
    const couponData = req.body;

    // The API requires some fields that we can set defaults for
    const payload = {
      ...couponData,
      ref: couponData.code, // Use the code as the reference
      validUntil: "2025-12-31T23:59:59Z", // A default expiry for the hackathon
      maxCoupons: 1000, // A high limit
      availableCoupons: 1000,
    };

    await rapyd.createCoupon(merchantId, payload);

    res.status(201).json({ message: "Coupon created successfully!" });
  } catch (error) {
    console.error("Error creating coupon:", error.response ? error.response.data : error);
    res.status(500).json({ error: "Failed to create coupon." });
  }
};

const getAnalyticsData = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const response = await rapyd.getTransactions(merchantId);
    const transactions = response?.data?.transactions ?? [];

    // Process the data: group transactions by day and sum the values
    const dailyTotals = transactions.reduce((acc, tx) => {
      // Only include successful "CREDIT" transactions (money received)
      if (tx.txType.toUpperCase() === "CREDIT") {
        const date = tx.createdAt.split("T")[0]; // Get 'YYYY-MM-DD'
        const value = parseFloat(tx.value);
        acc[date] = (acc[date] || 0) + value;
      }
      return acc;
    }, {});

    // Convert the processed object into an array suitable for charting
    const chartData = Object.keys(dailyTotals).map((date) => ({
      date,
      total: dailyTotals[date],
    })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

module.exports = {
  getOverviewStats,
  getMerchantTransactions,
  getMerchantCustomers,
  getCommunityFundBalance,
  createMerchantCoupon,
  getAnalyticsData,
};