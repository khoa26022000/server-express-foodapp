// Quản lý người dùng/ khách hàng
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComboSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  discountCombo: {
    type: Number,
    required: true,
  },
  photo: {
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
  start: {
    type: String,
  },
  end: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("combos", ComboSchema);
