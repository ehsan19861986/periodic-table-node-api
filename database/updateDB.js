const logger = require("../winstonConfig");
const mongoose = require("mongoose");
const { updateElementTable } = require("./setUpElementTable");
const { main } = require("./DBConnection");

updateChemicalPeriodicTableDB = async function () {
  try {
    const isElementTableUpdated = await updateElementTable();
    return isElementTableUpdated === 0;
  } catch (error) {
    logger.error(
      "updateDB, updateChemicalPeriodicTableDB function, an error happened while updating database. the Error is ",
      error
    );
  }
};

const mainUpdateDB = async function () {
  try {
    main();
    const result = await updateChemicalPeriodicTableDB();

    await mongoose.disconnect();
  } catch (error) {
    logger.error(
      "updateDB, mainUpdateDB function, following error happened while connecting to DB ",
      error
    );
  }
};

mainUpdateDB();
