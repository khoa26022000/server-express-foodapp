const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuComboSchema = new Schema({
  idMenu: {
    type: Schema.Types.ObjectId,
    ref: "menus",
    required: true,
  },
  idCombo: {
    type: Schema.Types.ObjectId,
    ref: "combos",
  },
});

module.exports = mongoose.model("menuCombos", MenuComboSchema);
