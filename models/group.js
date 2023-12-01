const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = Schema({
  name: String,
  description: String,
  listOfElements: [
    {
      symbol: String,
      elementId: {
        type: Number,
        ref: "Element",
      },
    },
  ],
});

module.exports = mongoose.model("Group", groupSchema);
