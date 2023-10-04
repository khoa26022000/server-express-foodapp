// Quản lý topping
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChooseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "restaurants",
  },
  choose: {
    type: Boolean, // true là chọn nhiều
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("choose", ChooseSchema);
