const mongoose = require('mongoose');

// Schema for redeeming points
const redeemPointsSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String },
  redeemedAt: { type: Date, default: Date.now },
});

// Schema for available points per restaurant
const availablePointsSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  points: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },  // Note: This should ideally be hashed
  userType: {
    type: String,
    required: true,
    enum: ['customer', 'admin', 'restaurant', 'scanner'],
    default: 'customer',
  },
  availablePoints: [availablePointsSchema], // Changed to array of available points per restaurant
  redeemPoints: [redeemPointsSchema], 
  qrCode: { type: String },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
