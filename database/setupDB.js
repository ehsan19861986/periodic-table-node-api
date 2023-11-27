const logger = require("../winstonConfig");
const mongoose = require("mongoose");
const { initElementTable } = require("./setUpElementTable");
const { main } = require("./DBConnection");

initChemicalPeriodicTableDB = async function () {
  try {
    const isElementTableInitiated = await initElementTable();
    return isElementTableInitiated === 0;
  } catch (error) {
    logger.error(
      "setupDB, initChemicalPeriodicTableDB function, an error happened while populating database. the Error is ",
      error
    );
  }
};

const mainSetupDB = async function () {
  try {
    main();
    const result = await initChemicalPeriodicTableDB();

    await mongoose.disconnect();
  } catch (error) {
    logger.error(
      "setupDB, mainSetupDB function, following error happened while connecting to DB ",
      error
    );
  }
};

mainSetupDB();
