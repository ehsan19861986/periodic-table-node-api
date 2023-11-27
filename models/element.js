const mongoose = require("mongoose");
const { Schema } = mongoose;

const elementSchema = new Schema(
  {
    _id: Number,
    name: String,
    symbol: String,
    atomicNumber: Number,
    atomicMass: Number,
  },
  // {
  //   statics: {
      
  //   },
  // }
);

module.exports = mongoose.model("Element", elementSchema);
