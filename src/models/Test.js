// Quản lý loại món ăn
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  details: [
    {
      nameDetail: {
        type: String,
        unique: true,
      },
      toppings: [
        {
          nameTopping: {
            type: String,
            unique: true,
          },
          priceTopping: {
            type: Number,
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("test", TestSchema);
