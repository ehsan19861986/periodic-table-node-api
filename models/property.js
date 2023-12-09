const mongoose = require("mongoose");
const { Schema } = mongoose;

const propertySchema = Schema({
  _id: Number,
  atomicNumber: Schema.Types.Mixed,
  atomicMass: Schema.Types.Mixed,
  standardState: String,
  oxidationStates: String,
  electronegativity: Schema.Types.Mixed,
  atomicRadius: Schema.Types.Mixed,
  ionizationEnergy: Schema.Types.Mixed,
  electronAffinity: Schema.Types.Mixed,
  electronConfiguration: String,
  meltingPoint: Schema.Types.Mixed,
  boilingPoint: Schema.Types.Mixed,
  density: Schema.Types.Mixed,
  groupBlock: String,
  yearDiscovered: Schema.Types.Mixed,
  elementId: {
    type: Number,
    ref: "Element",
  },
});

module.exports = mongoose.model("Property", propertySchema);
