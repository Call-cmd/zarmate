const axios = require("axios");

const client = axios.create({
  baseURL: process.env.RAPYD_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.RAPYD_API_KEY}`,
    "Content-Type": "application/json",
  },

});

module.exports = {
  createUser: (data) => client.post("/users", data),
  enableGasForUser: (userId) => client.post(`/activate-pay/${userId}`, {}),
  enableBusinessGas: () => client.post("/enable-gas", {}),
  mintFunds: (data) => client.post("/mint", data),
  transferFunds: (userId, data) => client.post(`/transfer/${userId}`, data),
  getBalance: (userId) => client.get(`/${userId}/balance`),
  getBusinessFloat: () => client.get("/float"),
  getTransactions: (userId) => client.get(`/${userId}/transactions`),
  createCharge: (userId, data) => client.post(`/charge/${userId}/create`, data),
  getCharge: (chargeId) => client.get(`/retrieve-charge/${chargeId}`),
  updateCharge: (userId, chargeId, data) => client.put(`/charge/${userId}/${chargeId}/update`, data),
  createCoupon: (userId, data) => client.post(`/coupons/${userId}`, data),
  getAllCoupons: () => client.get("/coupons"),
  claimCoupon: (userId, data) => client.patch(`/coupons/claim/${userId}`, data),
};