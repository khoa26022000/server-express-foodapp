// Quản cart
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartComboSchema = new mongoose.Schema({
  idOrder: {
    type: Schema.Types.ObjectId,
    ref: "orders",
    required: true,
  },
  idCombo: {
    type: Schema.Types.ObjectId,
    ref: "combos",
    required: true,
  },
  quantityCombo: {
    type: Number,
  },
  cost: Number,
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("cartcombos", CartComboSchema);
