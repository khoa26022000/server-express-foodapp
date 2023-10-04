const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("pay", paySchema);
