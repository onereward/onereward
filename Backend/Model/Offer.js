const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 1,
  },
  active: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  restaurantName: {
    type: String,
    required: true, // You can make this optional if you want to
  },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
