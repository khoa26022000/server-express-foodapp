const express = require("express");
const router = express.Router();
const Pay = require("../models/Pay");

router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    const newPay = new Pay({
      name,
    });
    await newPay.save();

    res.json({ success: true, message: "Tạo thành công", newPay });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

router.get("/", async (req, res) => {
  const pay = await Pay.find();
  return res.json({
    success: true,
    message: "Hình thức thanh toán",
    pay,
  });
});

module.exports = router;
