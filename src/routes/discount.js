const express = require("express");
const router = express.Router();
const Discount = require("../models/Discount");
const Food = require("../models/Food");
const DiscountDetail = require("../models/DiscountDetails");
const verifyToken = require("../middleware/restaurant");
const { now } = require("mongoose");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "mwg",
  api_key: "975679435312346",
  api_secret: "e_z9cdptDauUXzIJhAi-RgNCLFM",
});
// const ObjectId = require("mongodb").ObjectId;
/// Thêm discount và discountDetail

const ktTrung = async (array, start, end) => {
  const isFood = [];
  for (let i of array) {
    const discountDetail = await DiscountDetail.find({ idFood: i.id }).populate(
      "idFood"
    );
    if (discountDetail) {
      for (let item of discountDetail) {
        const date1 = new Date(item.start).toISOString();
        const date2 = new Date(item.end).toISOString();

        // console.log("start", start, "end", end, "date1", date1, "date2", date2);
        if (!(start > date2 || (start < date1 && end < date1))) {
          isFood.push(item.idFood.name);
          console.log(isFood);
          // return false;
        }
        // return true;
        // if (start > date1 && end < date2) return false;
        // if (start === date1 && end == date2) return false;
      }
    }
  }
  return isFood;
};

const getFood = async (food) => {
  const discountDetail = await DiscountDetail.find({
    idFood: food._id,
  }).populate("idDiscount");
  const discounts = [];
  let priceTotal = food.price;
  for (let item of discountDetail) {
    const date1 = new Date(item.start).toISOString();
    const date2 = new Date(item.end).toISOString();
    const date = new Date().toISOString();
    if (date1 < date && date2 > date) {
      discounts.push(item.idDiscount);
      priceTotal = food.price - (food.price / 100) * 20;
    }
  }

  return { ...food._doc, discounts, priceTotal };
};
const getDiscount = async (discount) => {
  const discountDetail = await DiscountDetail.find({
    idDiscount: discount._id,
  }).populate({ path: "idFood", populate: { path: "choose" } });

  return { ...discount._doc, discountDetail };
};

router.post("/", verifyToken, async (req, res) => {
  const { nameDiscount, start, end, arrayFood, photo } = req.body;
  const date1 = new Date(start).toISOString();
  const date2 = new Date(end).toISOString();
  const date = new Date().toISOString();
  const is = await ktTrung(arrayFood, date1, date2);
  // console.log("1", date1, "2", date2, "0", date);
  if (date > date1 || date > date2)
    return res.status(200).json({
      success: false,
      message: "Ngày bắt đầu và kết thúc phải lớn hơn hoặc khác ngày hiện tại",
    });

  if (date1 > date2)
    return res.status(200).json({
      success: false,
      message: "Ngày bắt đầu phải bé hơn ngày kết thúc",
    });
  if (is.length !== 0)
    return res.status(200).json({
      success: false,
      message: `Món ăn có khoảng khuyến mãi trùng: ${is}`,
    });
  try {
    var uri = "";
    const result = await cloudinary.v2.uploader.upload(photo, {
      allowed_formats: ["jpg", "png"],
      public_id: "",
      folder: "foods",
    });
    uri = result.url;
    const newDiscount = new Discount({
      nameDiscount,
      photo: uri,
      restaurant: req.restaurantId,
    });
    await newDiscount.save();
    arrayFood.forEach(async (element) => {
      const newDiscountDetail = new DiscountDetail({
        idFood: element.id,
        idDiscount: newDiscount._id,
        discount: element.discount,
        start: new Date(start),
        end: new Date(end),
      });
      await newDiscountDetail.save();
    });
    res.json({ success: true, message: "Tạo thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

/// lấy chi tiết discount theo cửa hàng
router.get("/restaurant", verifyToken, async (req, res) => {
  try {
    const discount = await Discount.find({ restaurant: req.restaurantId });

    if (discount) {
      for (let i = 0; i < discount.length; i++) {
        discount[i] = await getDiscount(discount[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất khuyến mãi",
      discount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// delete Discount
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const discountDeleteCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    const deletedDiscount = await Discount.findOneAndDelete(
      discountDeleteCondition
    );
    await DiscountDetail.find({ idDiscount: req.params.id })
      .deleteMany()
      .exec();

    // User not authorised or post not found
    if (!deletedDiscount)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });

    res.json({ success: true, post: deletedDiscount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// update discount
router.put("/:id", verifyToken, async (req, res) => {
  const { nameDiscount, photo } = req.body;

  if (!nameDiscount)
    return res
      .status(400)
      .json({ success: false, message: "Name and Price are required" });

  try {
    var uri = "";
    const result = await cloudinary.v2.uploader.upload(photo, {
      allowed_formats: ["jpg", "png"],
      public_id: "",
      folder: "foods",
    });
    uri = result.url;
    let updateDiscount = {
      nameDiscount,
      photo: uri,
    };

    const discountUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };

    updatedDiscount = await Discount.findOneAndUpdate(
      discountUpdateCondition,
      updateDiscount,
      {
        new: true,
      }
    );

    if (!updatedDiscount)
      return res.status(401).json({
        success: false,
        message: "Menu not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedDiscount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const getDiscountAll = async (discount) => {
  const discountDetail = await DiscountDetail.find({
    idDiscount: discount._id,
  });
  const discountList = [];
  for (let item of discountDetail) {
    const date1 = new Date(item.start).toISOString();
    const date2 = new Date(item.end).toISOString();
    const date = new Date().toISOString();
    if (date1 < date && date2 > date) {
      discountList.push(item);
      return { ...discount._doc, date1, date2 };
    }
  }
  return null;
};
// discount tất cả nhà hàng
router.get("/restaurantAll", async (req, res) => {
  try {
    const discount = await Discount.find().populate("restaurant");

    if (discount) {
      for (let i = 0; i < discount.length; i++) {
        discount[i] = await getDiscountAll(discount[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất khuyến mãi",
      discount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

module.exports = router;
