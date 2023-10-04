const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const Food = require("../models/Food");
const verifyToken = require("../middleware/restaurant");

// @route POST api/category
// @desc create category
// @access Public

router.post("/", verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name)
    return res.status(400).json({ success: false, message: "Thiếu tên" });

  try {
    const newMenu = new Menu({
      name,
      restaurant: req.restaurantId, //id Restaurant
    });
    await newMenu.save();

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
    const menu = await Menu.find();
    return res.json({
      success: true,
      message: "Tất cả category",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// @route GET api/menu
// @desc get category by restaurant
// @access Public
router.get("/:id", async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const menu = await Menu.find({ restaurant: req.params.id }).sort({
      createdAt: -1,
    });
    return res.json({
      success: true,
      message: "Menu của cửa hàng",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const menuDeleteCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    const foodByMenu = await Food.find({ menu: req.params.id });
    if (Object.values(foodByMenu).length === 0) {
      const deletedMenu = await Menu.findOneAndDelete(menuDeleteCondition);
      if (!deletedMenu)
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised",
        });
      res.json({ success: true, menu: deletedMenu });
    } else {
      return res.json({
        success: false,
        message: "Menu hiện tại đang có món ăn, không thể xoá !",
        food: foodByMenu,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// update

router.put("/:id", verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });

  try {
    let updateMenu = {
      name,
    };

    const menuUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };

    updatedMenu = await Menu.findOneAndUpdate(menuUpdateCondition, updateMenu, {
      new: true,
    });

    if (!updatedMenu)
      return res.status(401).json({
        success: false,
        message: "Menu not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedMenu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
