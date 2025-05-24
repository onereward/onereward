const express = require("express");
const router = express.Router();
const Redemption = require("../Model/Redemption");

router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      restaurantName,
      rewardDescription,
      pointsUsed,
      redeemSuccessfull,
    } = req.body;

    if (!customerId || !customerName || !restaurantName || !rewardDescription || !pointsUsed) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRedemption = new Redemption({
      customerId,
      customerName,
      restaurantName,
      rewardDescription,
      pointsUsed,
      redeemSuccessfull: redeemSuccessfull === true,
    });

    const savedRedemption = await newRedemption.save();
    res.status(201).json({ message: "Redemption recorded", data: savedRedemption });
  } catch (error) {
    console.error("Redemption save failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router;
