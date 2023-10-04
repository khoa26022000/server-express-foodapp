// Quản lý loại món ăn
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListChooseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  choose: {
    type: Schema.Types.ObjectId,
    ref: "choose",
    required: true,
  },
  // food: {
  //   type: Schema.Types.ObjectId,
  //   ref: "foods",
  //   required: true,
  // },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("listChoose", ListChooseSchema);
