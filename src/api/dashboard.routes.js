const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// A single endpoint to get all the stats for the main overview page
router.get(
  "/merchant/:merchantId/overview",
  dashboardController.getOverviewStats
);

// Endpoint to get the detailed transaction list for the "Transactions" tab
router.get(
  "/merchant/:merchantId/transactions",
  dashboardController.getMerchantTransactions
);

// Endpoint to get the customer list for the "Customers" tab
router.get(
  "/merchant/:merchantId/customers",
  dashboardController.getMerchantCustomers
);

// Endpoint to get the community fund balance
router.get("/community-fund", dashboardController.getCommunityFundBalance);

// Endpoint to create a coupon for a merchant
router.post("/merchant/:merchantId/coupons", dashboardController.createMerchantCoupon);

// Endpoint to get analytics data
router.get("/merchant/:merchantId/analytics", dashboardController.getAnalyticsData);

module.exports = router;