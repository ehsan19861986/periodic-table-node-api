const fs = require("fs");
const logger = require("../winstonConfig");
const path = require("path");
const Group = require("../models/group");

exports.initGroupTable = async function (updateDatabase = false) {
  try {
    if (updateDatabase) {
      await Group.deleteMany({});
    }
    const storedGroupCount = await Group.countDocuments({});
    if (!storedGroupCount) {
      const tableData = fs.readFileSync(
        path.join(__dirname, "..", "periodicTableGroups.json"),
        "utf8"
      );
      const { groups } = JSON.parse(tableData);
      for (const groupObj of groups) {
        const groupProperty = new Group({
          name: groupObj.name,
          description: groupObj.description,
          listOfElements: groupObj.listOfElements,
        });
        await groupProperty.save();
      }
    }
    return 0;
  } catch (error) {
    logger.error(
      "setUpGroupTable, initPropertyTable function, an error happened while reading table data from file. the Error is ",
      error
    );
    return 1;
  }
};
