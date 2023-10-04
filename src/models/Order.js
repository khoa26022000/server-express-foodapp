// Quản cart
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // foods: [
    //   {
    //     food: {
    //       type: Schema.Types.ObjectId,
    //       ref: "foods",
    //       required: true,
    //     },
    //     listChoose: [
    //       {
    //         choose: {
    //           type: Schema.Types.ObjectId,
    //           ref: "listChooses",
    //         },
    //         quantityChoose: {
    //           type: Number,
    //         },
    //         totalChoose: {
    //           type: Number,
    //           required: true,
    //         },
    //       },
    //     ],
    //     quantityInCart: {
    //       type: Number,
    //       default: 1,
    //     },
    //     totalFood: {
    //       type: Number,
    //       required: true,
    //     },
    //   },
    // ],
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "restaurants",
    },
    pay: {
      type: Schema.Types.ObjectId,
      ref: "pay",
    },
    status: {
      type: Number,
      default: 0,
    },
    ship: {
      type: Number,
    },
    address: String,
    phoneNumber: String,
    totalCost: Number,
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", OrderSchema);
