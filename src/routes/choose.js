const express = require("express");
const router = express.Router();
const Choose = require("../models/Choose");
const ListChoose = require("../models/ListChoose");
const verifyToken = require("../middleware/restaurant");

// @route POST api/category
// @desc create category
// @access Public

router.post("/", verifyToken, async (req, res) => {
  const { name, choose } = req.body;
  try {
    const newChoose = new Choose({
      name,
      restaurant: req.restaurantId,
      choose,
    });
    await newChoose.save();

    res.json({ success: true, message: "Tạo thành công thành công" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Tạo thất bại thất bại${error}` });
  }
});

// @route GET api/menu
// @desc get category by restaurant
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const choose = await Choose.find({ restaurant: req.params.id });
    return res.json({
      success: true,
      message: "choose của món ăn",
      choose,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

//update
router.put("/:id", verifyToken, async (req, res) => {
  const { name, choose } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });

  try {
    let updateChoose = {
      name,
      choose,
    };

    const chooseUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };

    updatedChoose = await Choose.findOneAndUpdate(
      chooseUpdateCondition,
      updateChoose,
      {
        new: true,
      }
    );

    if (!updatedChoose)
      return res.status(401).json({
        success: false,
        message: "Choose not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedChoose,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//delete

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const chooseDeleteCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    const ListChooseByChoose = await ListChoose.find({ choose: req.params.id });
    if (Object.values(ListChooseByChoose).length === 0) {
      const deletedChoose = await Choose.findOneAndDelete(
        chooseDeleteCondition
      );
      if (!deletedChoose)
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised",
        });
      res.json({ success: true, choose: deletedChoose });
    } else {
      return res.json({
        success: false,
        message: "Choose hiện tại đang có item, không thể xoá !",
        food: ListChooseByChoose,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
