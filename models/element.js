const mongoose = require("mongoose");
const { Schema } = mongoose;

const elementSchema = new Schema({
  _id: Number,
  name: String,
  symbol: String,
  propertyId: {
    type: Number,
    ref: "Property",
  },
});

module.exports = mongoose.model("Element", elementSchema);
