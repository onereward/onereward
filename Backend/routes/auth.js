const express = require('express');
const User = require('../Model/User');
const router = express.Router();
const axios = require('axios');

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, phone, password, confirmPassword, userType } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords don't match" });
  }

  if (phone.length < 10) {
    return res.status(400).json({ error: "Please enter a valid phone number" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Call Flask to generate QR
    const flaskResponse = await axios.get('http://127.0.0.1:5001/generate_qr');
    const qrBase64 = flaskResponse.data.qr_base64;

    const newUser = new User({
      name,
      email,
      phone,
      password,
      userType: userType || 'customer',
      qrCode: qrBase64, // add this field to schema below
    });

    await newUser.save();
    res.status(201).json({ message: "User registered with QR", user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;
  
    try {
      // Check if the user exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: `No ${userType} found with this email` });
      }
  
      // Compare the entered password with the stored password (plain text comparison)
      if (user.password !== password) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Send success response without using JWT
      res.json({
        message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} logged in successfully`,
        user: {
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;
