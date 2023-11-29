const fs = require("fs");
const logger = require("../winstonConfig");
const path = require("path");
const Element = require("../models/element");

exports.initElementTable = async function () {
  try {
    const storedElementCount = await Element.countDocuments({});
    if (!storedElementCount) {
      const tableData = fs.readFileSync(
        path.join(__dirname, "..", "PubChemElements_all.json"),
        "utf8"
      );

      const {
        Table: { Row },
      } = JSON.parse(tableData);
      for (const eleObj of Row) {
        const { Cell: elementObj } = eleObj;
        const element = new Element({
          _id: parseInt(elementObj[0]),
          name: elementObj[2],
          symbol: elementObj[1],
          atomicNumber: parseInt(elementObj[0]),
          atomicMass: parseFloat(elementObj[3]),
        });
        await element.save();
      }
    }
    return 0;
  } catch (error) {
    logger.error(
      "setupElementTable, initElementTable function, an error happened while reading table data from file. the Error is ",
      error
    );
    return 1;
  }
};

exports.updateElementTable = async function () {
  try {
    await Element.deleteMany({});
    const storedElementCount = await Element.countDocuments({});
    if (!storedElementCount) {
      const tableData = fs.readFileSync(
        path.join(__dirname, "..", "PubChemElements_all.json"),
        "utf8"
      );

      const {
        Table: { Row },
      } = JSON.parse(tableData);
      for (const eleObj of Row) {
        const { Cell: elementObj } = eleObj;
        const element = new Element({
          _id: parseInt(elementObj[0]),
          name: elementObj[2],
          symbol: elementObj[1],
          atomicNumber: parseInt(elementObj[0]),
          atomicMass: parseFloat(elementObj[3]),
        });
        await element.save();
      }
    }
    return 0;
  } catch (error) {
    logger.error(
      "setupElementTable, updateElementTable function, an error happened while reading table data from file. the Error is ",
      error
    );
    return 1;
  }
};
