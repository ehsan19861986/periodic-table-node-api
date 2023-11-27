const mongoose = require("mongoose");
const { schema } = mongoose;

const propertySchema = schema({
  standardState: String,
  oxidationStates: String,
  electronegativity: Number,
  atomicRadius: String,
  ionizationEnergy: String,
  electronAffinity: String,
  meltingPoint: Number,
  boilingPoint: Number,
  density: Number,
  yearDiscovered: Number,
  elementId: {
    type: Number,
    ref: "Element",
  },
});

module.exports = mongoose.model("Property", propertySchema);
