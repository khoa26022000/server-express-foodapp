const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Food = require("../models/Food");
const ComboDetails = require("../models/ComboDetails");
const Combo = require("../models/Combo");
const CartFood = require("../models/CartFood");
const CartCombo = require("../models/CartCombo");
const momoSend = require("../../src/utils/momo");
const checkMomoSuccess = require("../../src/utils/momo");
const verifyToken = require("../middleware/auth");
const verifyTokenRestaurant = require("../middleware/restaurant");
const ObjectId = require("mongodb").ObjectId;
const haversine = require("haversine");
const moment = require("moment");
const stripe = require("stripe")(
  "pk_test_51JQY7gGpQnPLssGI67nM5xbkKCPJebmUWoWq2lwjGQoj8jbrz50EyOeOvaY02Wz07aajEQzfupCDXGpURgncf19R0027ZXALVH"
);
const jwt = require("jsonwebtoken");

const updateFood = async (idOrder) => {
  console.log("id", idOrder);
  findOrderFood = await CartFood.find({ idOrder: idOrder });
  if (findOrderFood) {
    console.log("ok");
  }
  for (let i of findOrderFood) {
    const foodID = {
      _id: i.idFood,
    };
    console.log(i._id);
    foodSL = await Food.findOne(foodID);
    console.log(foodSL.quantity);
    updateFood1 = await Food.findOneAndUpdate(
      foodID,
      { quantity: foodSL.quantity - i.quantityFood },
      { new: true }
    );
  }
};
const updateCombo = async (idOrder) => {
  findOrderCombo = await CartCombo.find({ idOrder: idOrder });
  for (let i of findOrderCombo) {
    const ComboID = { idCombo: i.idCombo };
    comboDetails = await ComboDetails.find(ComboID);
    for (let item of comboDetails) {
      foodSL = await Food.find({ _id: item.idFood });
      for (let j of foodSL) {
        let slTru = i.quantityCombo * item.quanlity;
        console.log(item.idFood);
        console.log("sltru", slTru);
        console.log("sl food", j.quantity, "name", j.name);
        let kq = j.quantity - slTru;
        console.log(kq);
        updateFood2 = await Food.findOneAndUpdate(
          { _id: item.idFood },
          { quantity: kq },
          { new: true }
        );
        if (updateFood2) {
          console.log("ok");
        }
      }
    }
  }
};

const updateFoodCancel = async (idOrder) => {
  findOrderFood = await CartFood.find({ idOrder: idOrder });
  for (let i of findOrderFood) {
    const foodID = {
      _id: i.idFood,
    };
    console.log(i._id);
    foodSL = await Food.findOne(foodID);
    console.log(foodSL.quantity);
    updateFood1 = await Food.findOneAndUpdate(
      foodID,
      { quantity: foodSL.quantity + i.quantityFood },
      { new: true }
    );
  }
};
const updateComboCancel = async (idOrder) => {
  findOrderCombo = await CartCombo.find({ idOrder: idOrder });
  for (let i of findOrderCombo) {
    const ComboID = { idCombo: i.idCombo };
    comboDetails = await ComboDetails.find(ComboID);
    for (let item of comboDetails) {
      foodSL = await Food.find({ _id: item.idFood });
      for (let j of foodSL) {
        let slTru = i.quantityCombo * item.quanlity;
        console.log(item.idFood);
        console.log("sltru", slTru);
        console.log("sl food", j.quantity, "name", j.name);
        let kq = j.quantity + slTru;
        console.log(kq);
        updateFood2 = await Food.findOneAndUpdate(
          { _id: item.idFood },
          { quantity: kq },
          { new: true }
        );
        if (updateFood2) {
          console.log("ok");
        }
      }
    }
  }
};

const getFoodAndComboCart = async (order) => {
  const cartFood = await CartFood.find({ idOrder: order._id })
    .populate("idFood")
    .populate({ path: "listChoose._id", select: "name price" });
  // .populate({ patch: "listChoose", populate: { patch: "idChoose" } });
  const cartCombo = await CartCombo.find({ idOrder: order._id }).populate(
    "idCombo"
  );

  return { ...order._doc, cartCombo, cartFood };
};

const getOrderDate = async (order, date1, date2) => {
  if (order.createdAt >= date1 && order.updatedAt <= date2) {
    // return { ...order._doc };
    const cartFood = await CartFood.find({ idOrder: order._id })
      .populate("idFood")
      .populate({ path: "listChoose._id", select: "name price" });
    // .populate({ patch: "listChoose", populate: { patch: "idChoose" } });
    const cartCombo = await CartCombo.find({ idOrder: order._id }).populate(
      "idCombo"
    );

    return { ...order._doc, cartCombo, cartFood };
  }
  return [];
};

const getKTFood = async (array) => {
  const isFood = [];
  if (array !== undefined) {
    for (let i of array) {
      food = await Food.find({
        _id: i.idFood,
        quantity: { $lt: i.quantityFood },
      });
      if (food) {
        for (let item of food) {
          isFood.push(`${item.name}, chỉ còn: ${item.quantity}`);
        }
      }
    }
  }
  return isFood;
};
const getKTCombo = async (array) => {
  const isCombo = [];
  if (array !== undefined) {
    for (let i of array) {
      comboDetails = await ComboDetails.find({ idCombo: i.idCombo })
        .populate("idFood")
        .populate("idCombo");
      for (let item of comboDetails) {
        console.log("đã vào forr");
        if (item.idFood.quantity < i.quantityCombo * item.quanlity) {
          console.log("ok");
          isCombo.push(item.idCombo.name);
        }
      }
    }
  }
  return isCombo;
};

const checkCoin = async (idUser, total) => {
  const userCoin = await User.findOne({ _id: idUser });
  if (userCoin.myCoin * 1000 < total) {
    return false;
  }
  return true;
};

const updateCoin = async (idUser, total) => {
  user = await User.findOne({ _id: idUser });
  console.log(user.myCoin);
  updateCoint = await User.findOneAndUpdate(
    { _id: idUser },
    { coin: total / 1000, myCoin: user.myCoin - total / 1000 },
    { new: true }
  );
};

const updateCoinOrderSuccess = async (idUser, total, pay) => {
  user = await User.findOne({ _id: idUser });
  console.log(user.myCoin);
  if (pay == "618928d5af7088a9fc3f2602") {
    updateCoint = await User.findOneAndUpdate(
      { _id: idUser },
      { coin: user.coin - total / 1000, myCoin: user.myCoin + 3 },
      { new: true }
    );
  }
  updateCoint = await User.findOneAndUpdate(
    { _id: idUser },
    { myCoin: user.myCoin + 3 },
    { new: true }
  );
};

const updateCoinCancel = async (idUser, total, pay) => {
  user = await User.findOne({ _id: idUser });
  updateCoint = await User.findOneAndUpdate(
    { _id: idUser },
    { myCoin: user.myCoin + user.coin, coin: 0 },
    { new: true }
  );
};
// CREATE

router.post("/", verifyToken, async (req, res) => {
  const { arrayFood, arrayCombo, restaurant, pay, ship, totalCost, total } =
    req.body;
  const is = await getKTFood(arrayFood);
  const isCombo = await getKTCombo(arrayCombo);

  if (is.length !== 0)
    return res.status(200).json({
      success: false,
      message: `Món ${is}`,
    });

  if (isCombo.length !== 0)
    return res.status(200).json({
      success: false,
      message: `Combo không đủ số lượng: ${isCombo}`,
    });
  const user = await User.findById(req.userId);
  if (user?.profile.address === undefined || user?.phoneNumber === undefined)
    return res.status(200).json({
      success: false,
      message: "Vui lòng nhập số điện thoại và địa chỉ",
    });
  // thanh toán bằng tiền coin
  if (pay === "618928d5af7088a9fc3f2602") {
    const isCoin = await checkCoin(req.userId, total);
    if (isCoin === false) {
      return res.status(200).json({
        success: false,
        message: "Số coin của bạn không đủ để thanh toán",
      });
    }
  }

  let url = "";
  try {
    if (pay === "61614a35855f83b83e611b82") {
      const resMoMo = await momoSend({
        arrayFood,
        arrayCombo,
        restaurant,
        pay,
        ship,
        totalCost,
        total,
        user: req.userId,
      });
      url = resMoMo.payUrl;
      console.log("url", url);
      if (resMoMo.resultCode == 0) {
        return res.status(200).json({
          success: true,
          message: "Chuyển qua thanh toán",
          uri: url,
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  try {
    const newOrder = new Order({
      user: req.userId,
      restaurant,
      pay,
      ship,
      address: user.profile.address,
      phoneNumber: user.phoneNumber,
      totalCost,
      total,
    });
    await newOrder.save();
    if (arrayFood !== undefined) {
      arrayFood.forEach(async (element) => {
        const newCartFood = new CartFood({
          idOrder: newOrder._id,
          idFood: element.idFood,
          quantityFood: element.quantityFood,
          listChoose: element.listChoose,
          cost: element.price,
          amount: element.amount,
          restaurant,
        });
        await newCartFood.save();
        await updateFood(newOrder._id);
      });
    }
    if (arrayCombo !== undefined) {
      arrayCombo.forEach(async (element) => {
        const newCartCombo = new CartCombo({
          idOrder: newOrder._id,
          idCombo: element.idCombo,
          quantityCombo: element.quantityCombo,
          cost: element.price,
          amount: element.amount,
        });
        await newCartCombo.save();
        await updateCombo(newOrder._id);
      });
    }

    if (pay === "618928d5af7088a9fc3f2602") {
      await updateCoin(req.userId, total);
    }
    return res.status(200).json({
      success: true,
      message: "Đặt đơn hàng thành công",
      uri: url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

// thanh toán bằng momo
router.get("/success-payment", async (req, res) => {
  const { token } = req.query;
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const {
    arrayFood,
    arrayCombo,
    restaurant,
    pay,
    ship,
    totalCost,
    total,
    user,
  } = decoded;
  const is = await getKTFood(arrayFood);
  const isCombo = await getKTCombo(arrayCombo);

  const paymentSuccessLink = "https://hufifood.vercel.app/";
  if (is.length !== 0)
    return res.status(200).json({
      success: false,
      message: `Món ${is}`,
    });

  if (isCombo.length !== 0)
    return res.status(200).json({
      success: false,
      message: `Combo không đủ số lượng: ${isCombo}`,
    });
  const user1 = await User.findById(user);
  if (user1?.profile.address === undefined || user1?.phoneNumber === undefined)
    return res.status(200).json({
      success: false,
      message: "Vui lòng nhập số điện thoại và địa chỉ",
    });
  try {
    const newOrder = new Order({
      user,
      restaurant,
      pay,
      ship,
      address: user1.profile.address,
      phoneNumber: user1.phoneNumber,
      totalCost,
      total,
    });
    await newOrder.save();
    if (arrayFood !== undefined) {
      arrayFood.forEach(async (element) => {
        const newCartFood = new CartFood({
          idOrder: newOrder._id,
          idFood: element.idFood,
          quantityFood: element.quantityFood,
          listChoose: element.listChoose,
          cost: element.price,
          amount: element.amount,
          restaurant,
        });
        await newCartFood.save();
        await updateFood(newOrder._id);
      });
    }
    if (arrayCombo !== undefined) {
      arrayCombo.forEach(async (element) => {
        const newCartCombo = new CartCombo({
          idOrder: newOrder._id,
          idCombo: element.idCombo,
          quantityCombo: element.quantityCombo,
          cost: element.price,
          amount: element.amount,
        });
        await newCartCombo.save();
        await updateCombo(newOrder._id);
      });
    }
    console.log("đã vào và xử lý xong");
    return res.redirect(paymentSuccessLink);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: errorCatch,
      errors: error.message,
    });
  }
});

// get order của khách hàng đã hoàn thành
router.get("/all", verifyToken, async (req, res) => {
  try {
    const order = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/stt0", verifyToken, async (req, res) => {
  try {
    const order = await Order.find({ user: req.userId, status: 0 })
      .sort({
        createdAt: -1,
      })
      .populate("restaurant")
      .populate("user")
      .populate("pay");

    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/stt1", verifyToken, async (req, res) => {
  try {
    const order = await Order.find({ user: req.userId, status: 1 })
      .sort({
        createdAt: -1,
      })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/stt2", verifyToken, async (req, res) => {
  try {
    const order = await Order.find({ user: req.userId, status: 2 })
      .sort({
        createdAt: -1,
      })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/stt3", verifyToken, async (req, res) => {
  try {
    const order = await Order.find({ user: req.userId, status: 3 })
      .sort({
        createdAt: -1,
      })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// order cuả cửa hàng
router.get("/restaurant", verifyTokenRestaurant, async (req, res) => {
  try {
    const order = await Order.find({
      restaurant: req.restaurantId,
      status: { $lt: 2 },
    })
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn của nhà hàng",
      order,
    });
  } catch (error) {}
});

// lấy đơn đã hủy của cửa hàng
router.get("/restaurant/stt3", verifyTokenRestaurant, async (req, res) => {
  try {
    const order = await Order.find({ restaurant: req.restaurantId, status: 3 })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCart(order[i]);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// lấy hóa đơn đã bán theo ngày của cửa hàng
router.get(
  "/restaurant/doanh-thu-ngay",
  verifyTokenRestaurant,
  async (req, res) => {
    const { dateStart, dateEnd } = req.query;
    const date1 = new Date(dateStart);
    const date2 = new Date(dateEnd);
    try {
      const order = await Order.find({
        restaurant: req.restaurantId,
        status: 2,
      })
        .populate("user")
        .populate("pay");
      if (order) {
        for (let i = 0; i < order.length; i++) {
          order[i] = await getOrderDate(order[i], date1, date2);
        }
      }

      return res.json({
        success: true,
        message: "tất cả hóa đơn của nhà hàng",
        order,
      });
    } catch (error) {}
  }
);

// bán hàng update trạng thái
router.put("/:id", verifyTokenRestaurant, async (req, res) => {
  // const { name, photo, description, price, quantity, choose } = req.body;
  try {
    const orderUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    order = await Order.findOne(orderUpdateCondition);
    if (order.status === 0) {
      updatedOrder = await Order.findOneAndUpdate(
        orderUpdateCondition,
        { status: 1 },
        {
          new: true,
        }
      );
    }
    if (order.status === 1) {
      updatedOrder = await Order.findOneAndUpdate(
        orderUpdateCondition,
        { status: 2 },
        {
          new: true,
        }
      );

      await updateCoinOrderSuccess(order.user, order.total, order.pay);
    }

    if (!updatedOrder)
      return res.status(401).json({
        success: false,
        message: "Hóa đơn không tồn tại",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      order: updatedOrder,
      // food: updateFood,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Hủy đơn hàng cho cửa hàng
router.put("/cancel/:id", verifyTokenRestaurant, async (req, res) => {
  try {
    const orderUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    updatedOrder = await Order.findOneAndUpdate(
      orderUpdateCondition,
      { status: 3 },
      {
        new: true,
      }
    );
    await updateFoodCancel(req.params.id);
    await updateComboCancel(req.params.id);
    if (updatedOrder.pay == "618928d5af7088a9fc3f2602") {
      await updateCoinCancel(
        updatedOrder.user,
        updatedOrder.total,
        updatedOrder.pay
      );
    }
    if (!updatedOrder)
      return res.status(401).json({
        success: false,
        message: "Hóa đơn không tồn tại",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Hủy đơn hàng cho khách hàng
router.put("/cancel/user/:id", verifyToken, async (req, res) => {
  try {
    const orderUpdateCondition = {
      _id: req.params.id,
      user: req.userId,
    };
    updatedOrder = await Order.findOneAndUpdate(
      orderUpdateCondition,
      { status: 3 },
      {
        new: true,
      }
    );
    await updateFoodCancel(req.params.id);
    await updateComboCancel(req.params.id);
    if (updatedOrder?.pay == "618928d5af7088a9fc3f2602") {
      await updateCoinCancel(
        updatedOrder.user,
        updatedOrder.total,
        updatedOrder.pay
      );
    }

    if (!updatedOrder)
      return res.status(401).json({
        success: false,
        message: "Hóa đơn không tồn tại",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// doanh thu theo tháng
router.get("/income", verifyTokenRestaurant, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          status: 2,
          restaurant: ObjectId(req.restaurantId),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// const getOrderChar = async (idOrder) => {

// };
router.get("/income1", verifyTokenRestaurant, async (req, res) => {
  const { dateStart, dateEnd } = req.query;
  const date1 = new Date(dateStart);
  const date2 = new Date(dateEnd);
  // const lastMonth = new Date(date1.setDate(date.getMonth() - 1));
  var date = new Date("2021-09-05T14:23:03.237+00:00");
  const a =
    (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
    "/" +
    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
    "/" +
    date.getFullYear();
  console.log(a);
  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: date1 },
          updatedAt: { $lte: date2 },
          status: 2,
          restaurant: ObjectId(req.restaurantId),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          // month: "$createdAt",
          // month: { $dayOfMonth: "$createdAt" },
          // month: { $dayOfYear: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// lấy khoảng cách giao hàng
router.get("/haversine", async (req, res) => {
  const { latStart, lngStart, latEnd, lngEnd } = req.query;
  const start = {
    latitude: latStart,
    longitude: lngStart,
  };

  // 10.805113892660701, 106.62225393413311

  const end = {
    latitude: latEnd,
    longitude: lngEnd,
  };
  res.json({
    km: haversine(start, end, { unit: "km" }),
  });
});

router.get("/thong-ke-theo-thang", verifyTokenRestaurant, async (req, res) => {
  const { dateStart, dateEnd } = req.query;
  const date1 = new Date(dateStart);
  const date2 = new Date(dateEnd);
  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: date1 },
          updatedAt: { $lt: date2 },
          status: 2,
          restaurant: ObjectId(req.restaurantId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          createdAt: { $first: "$createdAt" },
          totalCost: { $sum: "$totalCost" },
          total: { $sum: "$total" },
          totalShip: { $sum: "$ship" },
          sum: { $sum: 1 },
        },
      },
    ]);
    return res.json({
      success: true,
      message: "Doanh thu theo tháng",
      income,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

const getFoodAndComboCartDay = async (order, date) => {
  const d = moment(order.createdAt).format("DD/MM/YYYY");
  if (d != date) {
    return;
  }
  const cartFood = await CartFood.find({ idOrder: order._id })
    .populate("idFood")
    .populate({ path: "listChoose._id", select: "name price" });
  // .populate({ patch: "listChoose", populate: { patch: "idChoose" } });
  const cartCombo = await CartCombo.find({ idOrder: order._id }).populate(
    "idCombo"
  );

  return { ...order._doc, cartCombo, cartFood };
};

router.get("/thong-ke-theo-ngay", verifyTokenRestaurant, async (req, res) => {
  const { dateStart } = req.query;
  try {
    console.log("a");
    const order = await Order.find({
      restaurant: req.restaurantId,
      status: 2,
    })
      .populate("restaurant")
      .populate("user")
      .populate("pay");
    if (order) {
      for (let i = 0; i < order.length; i++) {
        order[i] = await getFoodAndComboCartDay(order[i], dateStart);
      }
    }
    return res.json({
      success: true,
      message: "tất cả hóa đơn",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

const foodName = async (idFood) => {
  const food = await Food.find({ _id: idFood._id }).select("name");
  return { food };
};

// const topFoodAndCombo = async (date1, date2, restaurantId) => {
//   const cartFood = await CartFood.aggregate([
//     {
//       $match: {
//         idOrder: order._id,
//       },
//     },
//     // {
//     //   $lookup: {
//     //     from: "foods",
//     //     localField: "phoneNumber",
//     //     foreignField: "phoneNumber",
//     //     as: "idFood",
//     //   },
//     // },
//     // { $unwind: "$idFood" },
//     // {
//     //   $project: {
//     //     sl: "$quantityFood",
//     //     tong: "$amount",
//     //     ten: "$idFood.name",
//     //   },
//     // },
//     {
//       $group: {
//         _id: "$idFood",
//         count: { $sum: "$quantityFood" },
//       },
//     },
//     // { $sort: { count: 1 } },
//   ]);

//   // if (cartFood) {
//   //   for (let i = 0; i < cartFood.length; i++) {
//   //     cartFood[i] = await foodName(cartFood[i]);
//   //   }
//   // }

//   // {
//   //   $lookup: {
//   //     from: "foods",
//   //     localField: "phoneNumber",
//   //     foreignField: "phoneNumber",
//   //     as: "idFood",
//   //   },
//   // },
//   // { $unwind: "$idFood" },
//   // {
//   //   $project: {
//   //     _id: "$_id",
//   //     quantityFood: "$quantityFood",
//   //     amount: "$amount",
//   //     name: "$idFood.name",
//   //   },
//   // },
//   //   .populate("idFood")
//   //   .populate({ path: "listChoose._id", select: "name price" });
//   // // .populate({ patch: "listChoose", populate: { patch: "idChoose" } });
//   // const cartCombo = await CartCombo.aggregate([
//   //   {
//   //     $match: {
//   //       idOrder: order._id,
//   //     },
//   //   },
//   //   {
//   //     $lookup: {
//   //       from: "combos",
//   //       localField: "name",
//   //       foreignField: "name",
//   //       as: "idCombo",
//   //     },
//   //   },
//   //   {
//   //     $group: {
//   //       _id: "$_id",
//   //       sum: { $sum: "$quantityCombo" },
//   //     },
//   //   },
//   // ]);
//   // .populate("idCombo");

//   return { ...order._doc, cartFood };
// };

const topFoodAndCombo = async (date1, date2, restaurantId) => {
  const arrayTop = [];
  // const income = await Order.aggregate([
  //   {
  //     $match: {
  //       createdAt: { $gte: date1 },
  //       updatedAt: { $lte: date2 },
  //       status: 2,
  //       restaurant: ObjectId(restaurantId),
  //     },
  //   },
  //   // {
  //   //   $group: {
  //   //     _id: "$_id",
  //   //   },
  //   // },
  // ]);
  // for (let item of income) {
  //   let id = item._id.toString();
  //   console.log("id", id, "idObject", ObjectId(id));
  const details = await CartFood.aggregate([
    {
      $match: {
        restaurant: ObjectId(restaurantId),
      },
    },
    {
      $group: {
        _id: "$idFood",
        // _id: {
        //   idFood: "$idFood",
        //   idOrder: "$idOrder",
        // },
        count: { $sum: "$quantityFood" },
      },
    },
    { $sort: { count: 1 } },
  ]);

  console.log("details", details);
  for (let i of details) {
    const food = await Food.find({ _id: i._id });
    for (let k of food) {
      console.log("ok");
      arrayTop.push({
        id: i._id.idFood,
        nameFood: k.name,
        count: i.count,
      });
    }
    // }
  }
  console.log("array", arrayTop);
  return arrayTop;
};

router.get("/topFood", verifyTokenRestaurant, async (req, res) => {
  const { dateStart, dateEnd } = req.query;
  const date1 = new Date(dateStart);
  const date2 = new Date(dateEnd);
  try {
    // const income = await Order.aggregate([
    //   {
    //     $match: {
    //       createdAt: { $gte: date1 },
    //       updatedAt: { $lte: date2 },
    //       status: 2,
    //       restaurant: ObjectId(req.restaurantId),
    //     },
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "users",
    //   //     localField: "phoneNumber",
    //   //     foreignField: "phoneNumber",
    //   //     as: "user",
    //   //   },
    //   // },
    //   {
    //     $group: {
    //       _id: "$_id",
    //     },
    //   },
    // ]);
    // const cartFood = [];
    // if (income) {
    //   for (let i = 0; i < income.length; i++) {
    //     income[i] = await topFoodAndCombo(income[i]);
    //     cartFood.push(income[i].cartFood);
    //   }
    // }
    const data = await topFoodAndCombo(date1, date2, req.restaurantId);
    return res.json({
      success: true,
      message: "Doanh thu theo tháng",
      data,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.get("/test", verifyTokenRestaurant, async (req, res) => {
//   try {
//     const income = await CartFood.aggregate([
//       {
//         $lookup: {
//           from: "foods",
//           localField: "phoneNumber",
//           foreignField: "phoneNumber",
//           as: "idFood",
//         },
//       },
//     ]);
//     return res.json({
//       success: true,
//       message: "Test",
//       income,
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
