const fs = require("fs");
const logger = require("../winstonConfig");
const path = require("path");
const Property = require("../models/property");

exports.initPropertyTable = async function (updateDatabase = false) {
  try {
    if (updateDatabase) {
      await Property.deleteMany({});
    }
    const storedPropertyCount = await Property.countDocuments({});
    if (!storedPropertyCount) {
      const tableData = fs.readFileSync(
        path.join(__dirname, "..", "PubChemElements_all.json"),
        "utf8"
      );

      const {
        Table: { Row },
      } = JSON.parse(tableData);
      for (const eleObj of Row) {
        const { Cell: elementObj } = eleObj;

        const elementProperty = new Property({
          _id: parseInt(elementObj[0]),
          atomicNumber: parseInt(elementObj[0]),
          atomicMass: parseFloat(elementObj[3]),
          standardState: elementObj[11],
          oxidationStates: elementObj[10],
          electronegativity:
            elementObj[6] !== "" ? parseFloat(elementObj[6]) : "N/A",
          atomicRadius: elementObj[7] !== "" ? parseInt(elementObj[7]) : "N/A",
          ionizationEnergy:
            elementObj[8] !== "" ? parseFloat(elementObj[8]) : "N/A",
          electronAffinity:
            elementObj[9] !== "" ? parseFloat(elementObj[9]) : "N/A",
          meltingPoint:
            elementObj[12] !== "" ? parseFloat(elementObj[12]) : "N/A",
          boilingPoint:
            elementObj[13] !== "" ? parseFloat(elementObj[13]) : "N/A",
          density: elementObj[14] !== "" ? parseFloat(elementObj[14]) : "N/A",
          electronConfiguration: elementObj[5],
          groupBlock: elementObj[15],
          yearDiscovered:
            elementObj[16] !== "" ? parseInt(elementObj[16]) : "N/A",
          elementId: parseInt(elementObj[0]),
        });
        await elementProperty.save();
      }
    }
    return 0;
  } catch (error) {
    logger.error(
      "setupPropertyTable, initPropertyTable function, an error happened while reading table data from file. the Error is ",
      error
    );
    return 1;
  }
};
