// Quản cart
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartFoodSchema = new mongoose.Schema({
  idOrder: {
    type: Schema.Types.ObjectId,
    ref: "orders",
    required: true,
  },
  idFood: {
    type: Schema.Types.ObjectId,
    ref: "foods",
    required: true,
  },
  quantityFood: {
    type: Number,
    default: 1,
  },
  listChoose: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "listChoose",
      },
      // quantityChoose: {
      //   type: Number,
      //   default: 1,
      // },
    },
  ],
  cost: Number,
  amount: {
    type: Number,
    required: true,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "restaurants",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("cartfoods", CartFoodSchema);
