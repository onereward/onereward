const mongoose = require("mongoose");

const RedemptionSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  rewardDescription: {
    type: String,
    required: true,
  },
  pointsUsed: {
    type: Number,
    required: true,
  },
  redeemSuccessfull: {
    type: Boolean,
    default: false,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Redemption", RedemptionSchema);
