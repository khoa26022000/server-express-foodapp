// Quản lý người dùng/ khách hàng
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
  nameDiscount: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  // discount: {
  //   type: Number,
  //   required: true,
  // },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "restaurants",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("discounts", DiscountSchema);
