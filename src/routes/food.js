const express = require("express");
const router = express.Router();
const Food = require("../models/Food");
const DiscountDetail = require("../models/DiscountDetails");
const MenuFood = require("../models/MenuFood");
const MenuCombo = require("../models/MenuCombo");
const Menu = require("../models/Menu");
const ComboDetails = require("../models/ComboDetails");
const Combo = require("../models/Combo");
const cloudinary = require("cloudinary");
const verifyToken = require("../middleware/restaurant");

//connect server img
cloudinary.config({
  cloud_name: "mwg",
  api_key: "975679435312346",
  api_secret: "e_z9cdptDauUXzIJhAi-RgNCLFM",
});

const getCombo = async (combo) => {
  const comboDetails = await ComboDetails.find({ idCombo: combo.id }).populate(
    "idFood"
  );
  let price = 0;
  let description = "";
  let quantity = 1;
  for (let i = 0; i < comboDetails.length; i++) {
    price += comboDetails[i].idFood.price * comboDetails[i].quanlity;
    if (comboDetails[i].idFood.quantity === 0) {
      quantity = 0;
    }
  }
  let arrayFood = [];
  let arraySl = [];
  let k = "";
  for (let item of comboDetails) {
    arrayFood.push({ sl: item.quanlity, name: item.idFood.name });
    k = arrayFood.map((item) => `${item.sl} ${item.name}`).join(", ");
    a = (arrayFood, arraySl).join(", ");
  }
  description = `Giá gốc: ${price}đ. Phần ăn: ${k}`;

  let lastPrice = price - (price / 100) * combo.discountCombo;
  return {
    ...combo._doc,
    comboDetails,
    price,
    lastPrice,
    description,
    quantity,
  };
};
const getComboMenu = async (combo) => {
  const date1 = new Date(combo.start).toISOString();
  const date2 = new Date(combo.end).toISOString();
  const date = new Date().toISOString();
  if (date1 < date && date2 > date) {
    /// note
    const comboDetails = await ComboDetails.find({
      idCombo: combo.id,
    }).populate("idFood");
    let price = 0;
    let description = "";
    let quantity = 1;
    for (let i = 0; i < comboDetails.length; i++) {
      price += comboDetails[i].idFood.price * comboDetails[i].quanlity;
      let tam = comboDetails[i].idFood.quantity - comboDetails[i].quanlity;
      // if (comboDetails[i].idFood.quantity === 0) {
      if (tam < 0) {
        quantity = 0;
      }
    }
    let arrayFood = [];
    let arraySl = [];
    let k = "";
    for (let item of comboDetails) {
      arrayFood.push({ sl: item.quanlity, name: item.idFood.name });
      k = arrayFood.map((item) => `${item.sl} ${item.name}`).join(", ");
      a = (arrayFood, arraySl).join(", ");
    }

    description = `Giá gốc: ${price}đ. Phần ăn: ${k}`;

    let lastPrice = price - (price / 100) * combo.discountCombo;
    return {
      ...combo._doc,
      comboDetails,
      price,
      lastPrice,
      description,
      quantity,
    };
  }
  return; // note
};
const getFood = async (food) => {
  const discountDetail = await DiscountDetail.find({
    idFood: food._id,
  }).populate("idDiscount");
  // const combo = await Combo.find({ menu: food.menu });
  // const discounts = [];
  // for (let item of discountDetail) {
  //   discounts.push(item.idDiscount);
  // }
  const discounts = [];
  let lastPrice = food.price;
  for (let item of discountDetail) {
    const date1 = new Date(item.start).toISOString();
    const date2 = new Date(item.end).toISOString();
    const date = new Date().toISOString();
    if (date1 < date && date2 > date) {
      discounts.push(item.idDiscount);
      lastPrice = food.price - (food.price / 100) * item.discount;
    }
  }

  return { ...food._doc, discounts, lastPrice };
};

const getComboAndFood = async (menu) => {
  const menuFood = await MenuFood.find({
    idMenu: menu._id,
  }).populate({ path: "idFood", populate: { path: "choose" } });
  const menuCombo = await MenuCombo.find({ idMenu: menu._id }).populate(
    "idCombo"
  );

  const food = [];
  const combo = [];
  const listFood = [];
  const listCombo = [];
  for (let item of menuFood) {
    food.push(item.idFood);
  }
  for (let item of menuCombo) {
    combo.push(item.idCombo);
  }

  for (let i = 0; i < food.length; i++) {
    listFood[i] = await getFood(food[i]);
  }
  for (let i = 0; i < combo.length; i++) {
    // listCombo[i] = await getCombo(combo[i]);
    listCombo[i] = await getComboMenu(combo[i]);
  }
  return { ...menu._doc, listCombo, listFood };
};

router.get("/all", verifyToken, async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const food = await Food.find({ restaurant: req.restaurantId, status: 1 });

    return res.json({
      success: true,
      message: "Món ăn của cửa hàng",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { name, photo, description, menu, price, quantity, choose } = req.body;
  if (!name || !price)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu tên và giá tiền" });

  try {
    var uri = "";
    const result = await cloudinary.v2.uploader.upload(photo, {
      allowed_formats: ["jpg", "png"],
      public_id: "",
      folder: "foods",
    });
    uri = result.url;
    const newFood = new Food({
      name,
      photo: uri,
      description,
      menu,
      restaurant: req.restaurantId,
      price,
      quantity,
      choose,
    });
    await newFood.save();
    const menuFood = new MenuFood({
      idFood: newFood._id,
      idMenu: menu,
    });
    await menuFood.save();

    res.json({ success: true, message: "Tạo thành công", newFood });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

router.get("/restaurant/:id", async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const food = await Food.find({
      restaurant: req.params.id,
      status: 1,
    }).populate("choose");
    if (food) {
      for (let i = 0; i < food.length; i++) {
        food[i] = await getFood(food[i]);
      }
    }
    return res.json({
      success: true,
      message: "Món ăn của cửa hàng",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/", async (req, res) => {
  try {
    const food = await Food.find({ status: 1 }).populate("choose");
    if (food) {
      for (let i = 0; i < food.length; i++) {
        food[i] = await getFood(food[i]);
      }
    }
    return res.json({
      success: true,
      message: "Món ăn của cửa hàng all",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.find({
      _id: req.params.id,
    });
    if (menu) {
      for (let i = 0; i < menu.length; i++) {
        menu[i] = await getComboAndFood(menu[i]);
      }
    }
    return res.json({
      success: true,
      message: "Món ăn menu của cửa hàng",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});
// update

router.put("/:id", verifyToken, async (req, res) => {
  const { name, photo, description, price, quantity, choose } = req.body;

  if (!name || !price)
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
    let updateFood = {
      name,
      photo: uri,
      description,
      price,
      quantity,
      choose,
    };

    const foodUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };

    updatedFood = await Food.findOneAndUpdate(foodUpdateCondition, updateFood, {
      new: true,
    });

    if (!updatedFood)
      return res.status(401).json({
        success: false,
        message: "Menu not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedFood,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route DELETE api/food
// @desc Delete food
// @access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const foodDeleteCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    const foodByCombo = await ComboDetails.find({
      idFood: req.params.id,
    }).populate("idFood");
    if (Object.values(foodByCombo).length === 0) {
      const deletedFood = await Food.findOneAndDelete(foodDeleteCondition);
      await MenuFood.find({ idFood: req.params.id }).deleteMany().exec();

      // User not authorised or post not found
      if (!deletedFood)
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised",
        });

      res.json({ success: true, post: deletedFood });
    } else {
      return res.json({
        success: false,
        message: "Món ăn đang có trong combo, không thể xoá !",
        food: foodByCombo,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/mon-an-lq/:id", async (req, res) => {
  try {
    const food = await ComboDetails.find({ idFood: req.params.id }).populate(
      "idCombo"
    );
    return res.json({
      success: true,
      message: "Món ăn có trong những combo",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

//thêm số lượng
router.put("/add/sl", verifyToken, async (req, res) => {
  const { quantity, arrayFood } = req.body;
  try {
    // let updateFood = {
    //   quantity,
    //   inStock: quantity,
    // };
    arrayFood.forEach(async (element) => {
      const foodUpdateCondition = {
        _id: element,
        restaurant: req.restaurantId,
      };
      food = await Food.findOne({ _id: element });
      updatedFood = await Food.findOneAndUpdate(
        foodUpdateCondition,
        { quantity: food.quantity + quantity, inStock: quantity },
        {
          new: true,
        }
      );
    });

    res.json({
      success: true,
      message: "Thành công!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// món ăn cửa hàng đã xóa
// router.get("/deleteFood", verifyToken, async (req, res) => {
//   try {
//     const food = await Food.find({ restaurant: req.restaurantId, status: 2 });
//     return res.json({
//       success: true,
//       message: "Món ăn của cửa hàng",
//       food,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: `Thất bại` });
//   }
// });
router.get("/deleteFood/success", verifyToken, async (req, res) => {
  // const { restaurant } = req.body;
  try {
    const food = await Food.find({ restaurant: req.restaurantId, status: 2 });

    return res.json({
      success: true,
      message: "Món ăn của cửa hàng",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});
// xóa món ăn khôi phục món ăn
router.put("/delete-revert/:id", async (req, res) => {
  try {
    const foodID = {
      _id: req.params.id,
    };
    const food = await Food.findOne(foodID);
    if (food.status === 1) {
      updateFood = await Food.findOneAndUpdate(
        foodID,
        { status: 2 },
        { new: true }
      );
    }

    if (food.status === 2) {
      updateFood = await Food.findOneAndUpdate(
        foodID,
        { status: 1 },
        { new: true }
      );
    }

    return res.json({
      success: true,
      message: "Update thành công",
      food,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

module.exports = router;
