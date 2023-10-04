const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuFoodSchema = new Schema({
  idMenu: {
    type: Schema.Types.ObjectId,
    ref: "menus",
    required: true,
  },
  idFood: {
    type: Schema.Types.ObjectId,
    ref: "foods",
  },
});

module.exports = mongoose.model("menuFoods", MenuFoodSchema);
