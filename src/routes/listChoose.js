const express = require("express");
const router = express.Router();
const ListChoose = require("../models/ListChoose");

// @route POST api/food
// @desc create food
// @access private
router.post("/", async (req, res) => {
  const { name, choose, price } = req.body;

  if (!name)
    return res.status(400).json({ success: false, message: "Thiếu tên" });

  try {
    const newListChoose = new ListChoose({
      name,
      choose,
      price,
    });
    await newListChoose.save();

    res.json({ success: true, message: "Tạo thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

// @route GET api/food
// @desc get food
// @access private
router.get("/:idChoose", async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const listChoose = await ListChoose.find({
      choose: req.params.idChoose,
    });
    return res.json({
      success: true,
      message: "Topping là",
      listChoose,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/", async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const listChoose = await ListChoose.find();
    return res.json({
      success: true,
      message: "Topping của food là",
      listChoose,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// @route PUT api/food
// @desc sữa food
// @access private
router.put("/:id", async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu tên và giá tiền" });

  try {
    const updateListChoose = {
      name,
      price,
    };
    const listChooseUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    updatedListChoose = await ListChoose.findOneAndUpdate(
      listChooseUpdateCondition,
      updateListChoose,
      { new: true }
    );
    if (!updatedListChoose)
      return res.status(401).json({
        success: false,
        message: "Choose not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedListChoose,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

//delete

router.delete("/:id", async (req, res) => {
  try {
    const listChooseDeleteCondition = {
      _id: req.params.id,
    };
    const deleteListChoose = await ListChoose.findOneAndDelete(
      listChooseDeleteCondition
    );

    // User not authorised or post not found
    if (!deleteListChoose)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });

    res.json({ success: true, choose: deleteListChoose });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
