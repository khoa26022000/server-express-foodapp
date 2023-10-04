// Quản lý loại món ăn
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
  name: {
    type: String,
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

module.exports = mongoose.model("menu", MenuSchema);
