const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountDetailsSchema = new Schema({
  idFood: {
    type: Schema.Types.ObjectId,
    ref: "foods",
    required: true,
  },
  idDiscount: {
    type: Schema.Types.ObjectId,
    ref: "discounts",
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  start: {
    type: String,
  },
  end: {
    type: String,
  },
  // discount: {
  //   type: Number,
  //   required: true,
  // },
});

module.exports = mongoose.model("discountDetails", DiscountDetailsSchema);
