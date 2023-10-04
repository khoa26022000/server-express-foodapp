// Quản lý loại món ăn
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
  name: {
    // tên cửa hàng
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  categories: {
    type: Schema.Types.Array,
    ref: "categories",
  },
  photo: {
    type: String,
  },
  duration: {
    type: String, // 20-30 min
  },
  open: {
    type: String,
  },
  close: {
    type: String,
  },
  location: {
    type: String,
  },
  lat: String,
  lng: String,
  owner: {
    fullName: String,
    avatar: String,
    CMND: String,
    dateOfBirth: String,
    male: Boolean,
    address: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // menu: {
  //     type: Schema.Types.ObjectId,
  //     ref: "foods"
  // }
});

module.exports = mongoose.model("restaurants", RestaurantSchema);
