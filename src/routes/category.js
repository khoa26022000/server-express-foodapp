const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// @route POST api/category
// @desc create category
// @access Public

router.post("/", async (req, res) => {
  const { name, icon } = req.body;

  if (!name || !icon)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu tên hoặc hình" });

  try {
    const newCategory = new Category({
      name,
      icon,
    });
    await newCategory.save();

    res.json({ success: true, message: "Tạo thành công thành công" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Tạo thất bại thất bại${error}` });
  }
});

// @route POST api/category
// @desc get category
// @access Public

router.get("/", async (req, res) => {
  try {
    const category = await Category.find();
    return res.json({
      success: true,
      message: "Tất cả category",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

module.exports = router;
