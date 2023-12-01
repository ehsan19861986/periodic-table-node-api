const logger = require("../winstonConfig");
const mongoose = require("mongoose");
const { initElementTable } = require("./setUpElementTable");
const { initPropertyTable } = require("./setupPropertyTable");
const { initGroupTable } = require("./setUpGroupTable");
const { main } = require("./DBConnection");

initChemicalPeriodicTableDB = async function () {
  try {
    const doesDBNeedsUpdate = process.env.npm_config_updatedatabase;
    const isElementTableInitiated = await initElementTable(doesDBNeedsUpdate);
    const isPropertyTableInitiated = await initPropertyTable(doesDBNeedsUpdate);
    const isGroupTableInitiated = await initGroupTable(doesDBNeedsUpdate);

    return (
      isElementTableInitiated === 0 &&
      isPropertyTableInitiated === 0 &&
      isGroupTableInitiated === 0
    );
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
