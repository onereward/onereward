// src/routes/restaurantRoutes.js
const express = require("express");
const router = express.Router();
const {
  getRestaurants,
  createRestaurant,
  updateRestaurant,  
  deleteRestaurant,
} = require("../controller/restaurantController");  
// GET all restaurants
router.get("/", getRestaurants);

// POST create a new restaurant
router.post("/", createRestaurant);

// PUT update a restaurant
router.put("/:id", updateRestaurant);  // Use the imported updateRestaurant function

// DELETE remove a restaurant
router.delete("/:id", deleteRestaurant);

module.exports = router;
