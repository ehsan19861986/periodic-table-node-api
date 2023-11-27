const mongoose = require("mongoose");
const logger = require("../winstonConfig");
require("dotenv").config();

exports.main = async function () {
  try {
    const connectionOptions = {
      dbName: process.env.DB_NAME,
    };
    await mongoose.connect(process.env.DB_URI, connectionOptions);
  } catch (error) {
    logger.error(
      "DBConection, main function, following error happened while connecting to DB ",
      error
    );
  }
};
