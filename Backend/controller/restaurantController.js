// src/controllers/restaurantController.js
const Restaurant = require("../Model/restaurantModel");

const getRestaurants = async (req, res) => {
    try {
      const restaurants = await Restaurant.find().sort({ join_date: -1 });
      res.json(restaurants); // Send all restaurant data as JSON
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  };
  
  // POST create a new restaurant
  const createRestaurant = async (req, res) => {
    const { name, email, status } = req.body;
  
    if (!name || !email || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const newRestaurant = new Restaurant({
        name,
        email,
        status,
        customers_count: 0,
      });
  
      await newRestaurant.save();
      res.status(201).json({
        message: "Restaurant created successfully",
        restaurant: newRestaurant,
      });
    } catch (err) {
      console.error("Error creating restaurant:", err);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  };
  
  // PUT update a restaurant
  const updateRestaurant = async (req, res) => {
    const { name, email, status } = req.body;
    const { id } = req.params;
  
    try {
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        id,
        { name, email, status },
        { new: true }
      );
  
      if (!updatedRestaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      res.json({
        message: "Restaurant updated successfully",
        restaurant: updatedRestaurant,
      });
    } catch (err) {
      console.error("Error updating restaurant:", err);
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  };
  
  // DELETE remove a restaurant
  const deleteRestaurant = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
  
      if (!deletedRestaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      res.json({ message: "Restaurant deleted successfully" });
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      res.status(500).json({ message: "Failed to delete restaurant" });
    }
  };

module.exports = { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant };
