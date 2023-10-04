const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const Restaurant = require("../models/Restaurant");
const DiscountDetail = require("../models/DiscountDetails");
const Discount = require("../models/Discount");
const verifyToken = require("../middleware/restaurant");
const haversine = require("haversine");

const getDiscount = async (restaurant) => {
  const discount = await Discount.find({ restaurant: restaurant._id });
  // console.log("discount", discount);
  const date = new Date().toISOString();
  let minDiscounts = [];
  let maxDiscounts = [];
  let nameDiscount = [];
  for (let item of discount) {
    const discountDetailsMin = await DiscountDetail.aggregate([
      {
        $match: {
          idDiscount: item._id,
        },
      },
      {
        $group: {
          _id: {
            id: "$idDiscount",
            start: "$start",
            end: "$end",
          },
          min: { $min: "$discount" },
          // start: { $push: "$start" },
          // end: { $push: "$end" },
        },
      },
    ]);
    const discountDetailsMax = await DiscountDetail.aggregate([
      {
        $match: {
          idDiscount: item._id,
        },
      },
      {
        $group: {
          _id: {
            id: "$idDiscount",
            start: "$start",
            end: "$end",
          },
          max: { $max: "$discount" },
        },
      },
    ]);
    for (let i of discountDetailsMin) {
      let date1 = new Date(i._id.start).toISOString();
      let date2 = new Date(i._id.end).toISOString();
      if (date1 < date && date2 > date) {
        minDiscounts.push(i.min);
      }
    }
    for (let i of discountDetailsMax) {
      let date1 = new Date(i._id.start).toISOString();
      let date2 = new Date(i._id.end).toISOString();
      if (date1 < date && date2 > date) {
        nameDiscount.push(item.nameDiscount);
        maxDiscounts.push(i.max);
      }
    }
  }

  let minDiscount = minDiscounts[0];
  let maxDiscount = maxDiscounts[0];
  return { ...restaurant._doc, minDiscount, maxDiscount, nameDiscount };
};

// @route POST api/restaurant
// @desc create restaurant
// @access Public

router.post("/register", async (req, res) => {
  const {
    name,
    phoneNumber,
    password,
    rating,
    categories,
    photo,
    duration,
    open,
    close,
    location,
    fullName,
    avatar,
    CMND,
    dateOfBirth,
    male,
    address,
    lat,
    lng,
  } = req.body;

  if (!name)
    return res.status(400).json({
      success: false,
      message: "Thiếu tên nhà hàng, số điện thoại hoặc password",
    });

  try {
    const phone = await Restaurant.findOne({ phoneNumber });
    if (phone)
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại đã có người sử dụng" });

    const hashedPassword = await argon2.hash(password);
    const newRestaurant = new Restaurant({
      name,
      phoneNumber,
      password: hashedPassword,
      rating,
      categories,
      photo,
      duration,
      open,
      close,
      location,
      owner: {
        fullName,
        avatar,
        CMND,
        dateOfBirth,
        male,
        address,
      },
      lat,
      lng,
    });
    await newRestaurant.save();

    const accessToken = jwt.sign(
      { restaurantId: newRestaurant._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "Tạo thành công thành công",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Tạo thất bại thất bại${error}` });
  }
});

// @route POST api/restaurant
// @desc get login
// @access Public

router.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password)
    return res.status(400).json({
      success: false,
      message: "Số điện thoại hoặc password không chính xác !!!",
    });

  try {
    const restaurant = await Restaurant.findOne({ phoneNumber });
    if (!restaurant)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại hoặc password không chính xác !!!",
      });

    // sai
    const passwordValid = await argon2.verify(restaurant.password, password);
    if (!passwordValid)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại hoặc password không chính xác !!!",
      });

    // đúng
    const accessToken = jwt.sign(
      {
        restaurantId: restaurant._id,
      },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Đăng nhập thất bại${error}` });
  }
});

// @route POST api/category
// @desc get category
// @access Public

router.get("/", async (req, res) => {
  try {
    const restaurant = await Restaurant.find();

    if (restaurant) {
      for (let i = 0; i < restaurant.length; i++) {
        restaurant[i] = await getDiscount(restaurant[i]);
      }
    }

    return res.json({
      success: true,
      message: "Tất cả cửa hàng",
      restaurant,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// @route GET api/auth/profile
// @desc profile user
// @access privte

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId).select(
      "-password"
    );
    return res.json({
      success: true,
      message: "Thông tin cửa hàng",
      restaurant,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// Phân trang
router.get("/page", async (req, res) => {
  try {
    let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
    const { number } = req.query || 1;

    const restaurant = await Restaurant.find()
      .skip(perPage * number - perPage)
      .limit(perPage);

    if (restaurant) {
      for (let i = 0; i < restaurant.length; i++) {
        restaurant[i] = await getDiscount(restaurant[i]);
      }
    }
    return res.json({
      success: true,
      message: "Tất cả cửa hàng",
      restaurant, // sản phẩm trên một page
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// Tìm kiếm theo tên or địa chỉ
router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;

    const restaurant = await Restaurant.find({
      name: { $regex: `${name}` },
    });
    return res.json({
      success: true,
      message: "Tất cả cửa hàng tìm kiếm",
      restaurant, // sản phẩm trên một page
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// Lọc theo category
router.get("/category/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.find({
      categories: req.params.id,
    });
    return res.json({
      success: true,
      message: "Tất cả cửa hàng tìm kiếm",
      restaurant, // sản phẩm trên một page
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

/// tìm cửa hàng gần nhất
router.get("/haversine/", async (req, res) => {
  try {
    const { latStart, lngStart } = req.query;
    const start = {
      latitude: latStart,
      longitude: lngStart,
    };
    let km = 0;
    const restaurant = [];
    const restaurantAll = await Restaurant.find();
    for (let i = 0; i < restaurantAll.length; i++) {
      const end = {
        latitude: restaurantAll[i].lat,
        longitude: restaurantAll[i].lng,
      };
      km = haversine(start, end, { unit: "km" });
      console.log(km);
      if (km < 5) {
        console.log("ok");
        restaurant.push(restaurantAll[i]);
      }
    }
    return res.json({
      success: true,
      message: "Tất cả cửa hàng tìm kiếm",
      restaurant, // sản phẩm trên một page
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Không có cửa hàng gần bạn` });
  }
});

router.get("/discount", async (req, res) => {
  try {
    const restaurant = await Restaurant.find();
    if (restaurant) {
      for (let i = 0; i < restaurant.length; i++) {
        restaurant[i] = await getDiscount(restaurant[i]);
      }
    }
    return res.json({
      success: true,
      message: "Tất cả cửa hàng khuyến mãi",
      restaurant,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: `Không có cửa hàng khuyến mãi` });
  }
});

module.exports = router;
