const express = require("express");
const router = express.Router();
const Combo = require("../models/Combo");
const ComboDetails = require("../models/ComboDetails");
const MenuCombo = require("../models/MenuCombo");
const verifyToken = require("../middleware/restaurant");
const ObjectId = require("mongodb").ObjectId;
const cloudinary = require("cloudinary");

//connect server img
cloudinary.config({
  cloud_name: "mwg",
  api_key: "975679435312346",
  api_secret: "e_z9cdptDauUXzIJhAi-RgNCLFM",
});

const ktTrung = async (array, id) => {
  const arrayCombo = [];
  const combo = await Combo.find({ restaurant: id });
  if (combo) {
    for (let i = 0; i < combo.length; i++) {
      combo[i] = await getComboBE(combo[i]);
      arrayCombo.push(combo[i].comboDetails);
    }
  }
  console.log(arrayCombo);
  console.log(arrayCombo.length);
  if (array.length === arrayCombo.length) {
    for (let i = 0; array.length; i++) {
      const id = ObjectId(array[i].id);
      for (let j = 0; j < arrayCombo.length; j++) {
        console.log("item", arrayCombo[j]);
        if (
          !(
            arrayCombo[j].quanlity === array[i].sl &&
            arrayCombo[j].idFood === id
          )
        )
          return false;
      }
    }
  }
  return true;

  // for (let i of array) {
  //   const comboDetails = await ComboDetails.find({ idFood: i.id });
  //   console.log(comboDetails.length);
  //   if (comboDetails) {
  //     for (let item = 0; item < comboDetails.length; item++) {
  //         for(let item1 = 1; item1 < comboDetails.length; item1++)
  //         if
  //       // if (!(item.quanlity === array.sl && item.idFood === i.id)) return false;
  //     }
  //   }
  // }
};

const getComboBE = async (combo) => {
  const comboDetails = await ComboDetails.find({ idCombo: combo.id });
  return { ...combo._doc, comboDetails };
};

const getCombo = async (combo) => {
  const date1 = new Date(combo.start).toISOString();
  const date2 = new Date(combo.end).toISOString();
  const date = new Date().toISOString();
  if (date1 < date && date2 > date) {
    const comboDetails = await ComboDetails.find({
      idCombo: combo.id,
    }).populate("idFood");
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
  }
  return;
};

const getComboCH = async (combo) => {
  const date1 = new Date(combo.start).toISOString();
  const date2 = new Date(combo.end).toISOString();
  const date = new Date().toISOString();
  // if (date < date2) {
  // if (date1 <= date && date2 > date) { //<=
  const comboDetails = await ComboDetails.find({
    idCombo: combo.id,
  }).populate("idFood");
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
  // }
  // return;
};

router.post("/", verifyToken, async (req, res) => {
  const { name, discountCombo, photo, menu, arrayFood, start, end } = req.body;
  const date1 = new Date(start).toISOString();
  const date2 = new Date(end).toISOString();
  const date = new Date().toISOString();
  if (date >= date1 || date > date2)
    /// >=
    return res.status(200).json({
      success: false,
      message: "Ngày bắt đầu và kết thúc phải lớn hơn hoặc khác ngày hiện tại",
    });

  if (date1 > date2)
    return res.status(200).json({
      success: false,
      message: "Ngày bắt đầu phải bé hơn ngày kết thúc",
    });

  try {
    var uri = "";
    const result = await cloudinary.v2.uploader.upload(photo, {
      allowed_formats: ["jpg", "png"],
      public_id: "",
      folder: "foods",
    });
    uri = result.url;
    const newCombo = new Combo({
      name,
      discountCombo,
      photo: uri,
      menu,
      restaurant: req.restaurantId,
      start: new Date(start),
      end: new Date(end),
    });
    await newCombo.save();
    const newMenuCombo = new MenuCombo({
      idCombo: newCombo._id,
      idMenu: menu,
    });
    await newMenuCombo.save();
    arrayFood.forEach(async (element) => {
      const newComboDetails = new ComboDetails({
        idFood: element.id,
        idCombo: newCombo._id,
        quanlity: element.sl,
      });
      await newComboDetails.save();
    });
    res.json({ success: true, message: "Tạo thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

// lấy combo theo cửa hàng
router.get("/", verifyToken, async (req, res) => {
  try {
    const combo = await Combo.find({ restaurant: req.restaurantId });
    if (combo) {
      for (let i = 0; i < combo.length; i++) {
        combo[i] = await getComboCH(combo[i]);
      }
    }
    return res.json({
      success: true,
      message: "Combo của cửa hàng",
      combo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.get("/all", async (req, res) => {
  try {
    const combo = await Combo.find();
    if (combo) {
      for (let i = 0; i < combo.length; i++) {
        combo[i] = await getCombo(combo[i]);
      }
    }
    return res.json({
      success: true,
      message: "Combo của cửa hàng",
      combo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comboDeleteCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };
    const deletedCombo = await Combo.findOneAndDelete(comboDeleteCondition);
    await MenuCombo.find({ idCombo: req.params.id }).deleteMany().exec();
    await ComboDetails.find({ idCombo: req.params.id }).deleteMany().exec();

    // User not authorised or post not found
    if (!deletedCombo)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });

    res.json({ success: true, post: deletedCombo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// update combo
router.put("/:id", verifyToken, async (req, res) => {
  const { name, photo } = req.body;
  // const date1 = new Date(start).toISOString();
  // const date2 = new Date(end).toISOString();
  // const date = new Date().toISOString();
  // if (date > date1 || date > date2)
  //   return res.status(200).json({
  //     success: false,
  //     message: "Ngày bắt đầu và kết thúc phải lớn hơn hoặc khác ngày hiện tại",
  //   });

  // if (date1 > date2)
  //   return res.status(200).json({
  //     success: false,
  //     message: "Ngày bắt đầu phải bé hơn ngày kết thúc",
  //   });
  // if (!name || !discountCombo)
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "Name and Price are required" });

  try {
    var uri = "";
    const result = await cloudinary.v2.uploader.upload(photo, {
      allowed_formats: ["jpg", "png"],
      public_id: "",
      folder: "foods",
    });
    uri = result.url;
    let updateCombo = {
      name,
      // discountCombo,
      photo: uri,
      // start: new Date(start),
      // end: new Date(end),
    };

    const comboUpdateCondition = {
      _id: req.params.id,
      restaurant: req.restaurantId,
    };

    updatedCombo = await Combo.findOneAndUpdate(
      comboUpdateCondition,
      updateCombo,
      {
        new: true,
      }
    );

    if (!updatedCombo)
      return res.status(401).json({
        success: false,
        message: "Menu not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      menu: updatedCombo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
module.exports = router;
