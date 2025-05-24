const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = 3000;
const Offer = require('./Model/Offer');
const authRoute = require('./routes/auth');
const redemptionRoutes = require("./routes/redeem");
const User = require('./Model/User');


app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoute);
app.use("/api/redeem", redemptionRoutes); 

// const mongoURI = 'mongodb+srv://OneReward:123@cluster0.iotikiq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
const mongoURI = 'mongodb://localhost:27017/OneReward'

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    password: {
      type: String,
      required: true,
    },
    join_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);



// Get a specific restaurant by ID (used by frontend CustomerCardDetail)
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Simulate loyalty data (until integrated from another source)
    const response = {
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      category: "General", // Add a real category if available
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${restaurant.name}`, // sample avatar
      points: 600, // replace with actual points if stored elsewhere
      history: [ // simulated points history
        { date: "2025-04-20", points: 100, type: "earned", description: "Welcome Bonus" },
        { date: "2025-04-21", points: -200, type: "redeemed", description: "Free Item" },
        { date: "2025-04-22", points: 50, type: "earned", description: "Meal Visit" }
      ]
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/by-restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const offers = await Offer.find({ restaurantName: restaurant.name });

    // ✅ Return wrapped in object
    res.status(200).json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new restaurant
app.post('/api/restaurants/create', async (req, res) => {
  const { name, email, password, status } = req.body;

  console.log("name : ", name , "email ", email , password  , status)

  
  console.log("callled .....")
  try {
    
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant with this email already exists' });
    }

    // Create a new restaurant instance
    const newRestaurant = new Restaurant({
      name,
      email,
      password,
      status,
    });

    // Save the new restaurant to the database
    await newRestaurant.save();

    res.status(201).json({ message: 'Restaurant created successfully' });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ join_date: -1 });
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a restaurant's details
app.put('/api/restaurants/update/:id', async (req, res) => {
  const { name, email, status } = req.body;
  const { id } = req.params;

  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { name, email, status },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a restaurant
app.delete('/api/restaurants/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





/// ...................... restaurants -->  customer ...........................


// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  joinDate: { type: String, required: true },
  totalPoints: { type: Number, default: 100 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

// Customer Model
const Customer = mongoose.model("Customer", customerSchema);


app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
});

// Get customer details by ID
app.get("/api/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer details", error });
  }
});

// Add a new customer
app.post("/api/customers", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, Email, and Phone are required" });
  }

  try {
    const newCustomer = new Customer({
      name,
      email,
      phone,
      joinDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      totalPoints: 0,
      status: "active",
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer added successfully",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding customer", error });
  }
});

// Send reward to customer
app.post("/api/customers/reward/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Simulate reward addition
    customer.totalPoints += 100; // Adding a fixed reward of 100 points for the example

    await customer.save();

    res.status(200).json({
      message: `Reward sent to ${customer.name}`,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending reward", error });
  }
});

// Update customer points
app.put("/api/customers/points/:id", async (req, res) => {
  const { id } = req.params;
  const { points, type } = req.body; // points = number, type = "add" or "redeem"

  if (!points || !type) {
    return res.status(400).json({ message: "Points and type are required" });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (type === "add") {
      customer.totalPoints += points;
    } else if (type === "redeem") {
      if (customer.totalPoints < points) {
        return res.status(400).json({ message: "Not enough points to redeem" });
      }
      customer.totalPoints -= points;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    await customer.save();

    res.status(200).json({
      message: `Points ${type}ed successfully`,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating points", error });
  }
});


app.post('/api/users/redeem', async (req, res) => {
  const { userEmail, restaurantName, points,  description } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize redeemPoints array if not present
    if (!user.redeemPoints) {
      user.redeemPoints = [];
    }

    user.redeemPoints.push({
      restaurantName,
      points,
      description,
      redeemedAt: new Date()
    });

    await user.save();

    res.status(200).json({ message: 'Redemption recorded successfully' });
  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/api/users/redeem-details", async (req, res) => {
  const { email, restaurant } = req.query;

  if (!email || !restaurant) {
    return res.status(400).json({ success: false, message: "Email and restaurant name are required." });
  }

  try {
    const user = await User.findOne({ email: email.toString() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const matchingRedemptions = user.redeemPoints.filter(
      (item) => item.restaurantName === restaurant
    );

    res.json({
      success: true,
      email,
      restaurant,
      redemptions: matchingRedemptions
    });
  } catch (error) {
    console.error("Error fetching redemption details:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.get("/api/customer/by-phone/:phone", async (req , res) => {
  const { phone } = req.params;
  console.log("****** phone L: " , phone );
  try {
    const customer = await User.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});






// ................................. Offers && Rewards ...................


app.get('/api/offers', async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single offer by ID
app.get('/api/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new offer
app.post('/api/offers', async (req, res) => {
  const { title, description, pointsRequired, active, expiryDate, restaurantName } = req.body;

  const newOffer = new Offer({
    title,
    description,
    pointsRequired,
    active,
    expiryDate,
    restaurantName,
  });

  try {
    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing offer
app.put('/api/offers/:id', async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(updatedOffer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an offer
app.delete('/api/offers/:id', async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    if (!deletedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// ............................. silders , featured. , bottom slider ................

const sliderSchema = new mongoose.Schema({
  title: String,
  image: String,
  order: Number,
  type: { type: String, enum: ['top', 'bottom'], required: true },  // Added 'type' field
});

const Slider = mongoose.model('Slider', sliderSchema);

// Routes
app.get('/api/:type-sliders', async (req, res) => {
  const type = req.params.type;
  try {
    const sliders = await Slider.find({ type }).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching sliders' });
  }
});

// Create a new Slider with type
app.post('/api/slider', async (req, res) => {
  const { title, image, order, type } = req.body;  // type is received in the body
  try {
    const newSlider = new Slider({ title, image, order, type });
    await newSlider.save();
    res.status(201).json(newSlider);
  } catch (err) {
    res.status(500).json({ error: 'Error creating new slider' });
  }
});

// Update an existing Slider with type
app.put('/api/slider/:id', async (req, res) => {
  const { title, image, order, type } = req.body;
  try {
    const updatedSlider = await Slider.findByIdAndUpdate(req.params.id, { title, image, order, type }, { new: true });
    res.json(updatedSlider);
  } catch (err) {
    res.status(500).json({ error: 'Error updating slider' });
  }
});

// Delete a Slider
app.delete('/api/slider/:id', async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slider deleted', slider });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting slider' });
  }
});

// Featured Restaurants Model
const restaurantSchemaA = new mongoose.Schema({
  name: String,
  image: String,
  featured: Boolean,
  order: Number,
});

const RestaurantA = mongoose.model('FeaturedRestaurant', restaurantSchemaA);



// Get Featured Restaurants
app.get('/api/featured-restaurants', async (req, res) => {
  try {
    const restaurants = await RestaurantA.find().sort({ order: 1 }).limit(6);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching featured restaurants' });
  }
});

// Create a new Restaurant
app.post('/api/admin/restaurant', async (req, res) => {
  const { name, image, featured, order } = req.body;
  try {
    const newRestaurantA = new RestaurantA({ name, image, featured, order });
    await newRestaurantA.save();
    res.status(201).json(newRestaurantA);
  } catch (err) {
    res.status(500).json({ error: 'Error creating new restaurant' });
  }
});

// Update an existing Restaurant
app.put('/api/admin/restaurant/:id', async (req, res) => {
  const { name, image, featured, order } = req.body;
  try {
    const updatedRestaurant = await RestaurantA.findByIdAndUpdate(req.params.id, { name, image, featured, order }, { new: true });
    res.json(updatedRestaurant);
  } catch (err) {
    res.status(500).json({ error: 'Error updating restaurant' });
  }
});

// Delete a Restaurant
app.delete('/api/admin/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await RestaurantA.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted', restaurant });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting restaurant' });
  }
});





app.get("/api/user-qr/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.qrCode) {
      return res.status(404).json({ success: false, message: "QR code not found for this user." });
    }

    res.json({ success: true, qrCode: user.qrCode });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/api/customer/scan-qr", async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ success: false, message: "Image required" });
    }
    const customer = await User.findOne({ qrCode: base64Image });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error("QR Scan Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


// API endpoint to update points
app.put('/api/user/points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { points, restaurantName } = req.body.availablePoints[0]; 
    const {type } = req.body;



    // Check if points and restaurantName are valid
    if (!points || !restaurantName) {
      return res.status(400).json({ message: "Points and restaurant name are required" });
    }

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If type is redeem, ensure there are enough points
    if (type === "redeem") {
      const restaurant = customer.availablePoints.find(
        (item) => item.restaurantName === restaurantName
      );

      if (!restaurant || restaurant.points < points) {
        return res.status(400).json({ message: "Not enough points to redeem" });
      }

      restaurant.points -= points; 
    }

   
    if (type === "add") {
      const restaurant = customer.availablePoints.find(
        (item) => item.restaurantName === restaurantName
      );


      if (!restaurant) {
        customer.availablePoints.push({ restaurantName, points });
      } else {
        restaurant.points += points; // Add points
      }
    }

    // Save the updated customer document
    await customer.save();

    res.status(200).json({
      message: `Points ${type === "add" ? "added" : "redeemed"} successfully`,
      customer,
    });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/user/:userId/points', async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameters

    // Find the user by ID
    const user = await User.findOne({ name: userId }); // If you're using `name` to find the user


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map available points for each restaurant
    const availablePoints = user.availablePoints.reduce((acc, curr) => {
      acc[curr.restaurantName] = curr.points;
      return acc;
    }, {});

    return res.status(200).json(availablePoints); // Return available points
  } catch (error) {
    console.error("Error fetching user points:", error);
    return res.status(500).json({ message: 'Server error' });
  }
});





app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port} and accessible on your local network.`);
  console.log(`e.g., http://localhost:${port} or http://<YOUR_MACHINE_IP>:${port}`);
});
