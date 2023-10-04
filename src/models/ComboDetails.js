const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComboDetailsSchema = new Schema({
  idFood: {
    type: Schema.Types.ObjectId,
    ref: "foods",
    required: true,
  },
  idCombo: {
    type: Schema.Types.ObjectId,
    ref: "combos",
    required: true,
  },
  quanlity: {
    type: Number,
    default: 1,
  },
  // discount: {
  //   type: Number,
  //   required: true,
  // },
});

module.exports = mongoose.model("comboDetails", ComboDetailsSchema);
