// Quản lý loại món ăn
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  description: {
    type: String,
  },
  menu: {
    type: Schema.Types.ObjectId,
    ref: "menus",
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "restaurants",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
  },
  inStock: {
    type: Number,
  },
  choose: {
    type: Schema.Types.Array,
    ref: "choose",
  },
  status: {
    type: Number,
    default: 1,
  },
  // discount: {
  //   type: Schema.Types.ObjectId,
  //   ref: "discounts",
  // },
  // details: [
  //   {
  //     nameDetail: {
  //       type: String,
  //       unique: true,
  //     },
  //     choose: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     idDetail: {
  //       type: String,
  //     },
  //     toppings: [
  //       {
  //         nameTopping: {
  //           type: String,
  //           unique: true,
  //         },
  //         priceTopping: {
  //           type: Number,
  //         },
  //         idTopping: {
  //           type: String,
  //         },
  //       },
  //     ],
  //   },
  // ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("foods", FoodSchema);
