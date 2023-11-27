const mongoose = require("mongoose");
const { schema } = mongoose;

const groupSchema = schema({
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
