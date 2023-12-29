const element = require("./models/element");
const group = require("./models/group");
const property = require("./models/property");
const { main } = require("./database/DBConnection");
const logger = require("./winstonConfig");
const app = require("./server");
const mongoose = require("mongoose");

main()
  .then(() => {
    return element.countDocuments({});
  })
  .then((elementCount) => {
    if (elementCount !== 118) {
      const err = new Error(
        "database for periodic table elements hasn't been initiated yet"
      );
      err.statusCode = 503;
      throw err;
    } else {
      return property.countDocuments({});
    }
  })
  .then((propertyCount) => {
    if (propertyCount !== 118) {
      const err = new Error(
        "database for periodic table element properties hasn't been initiated yet"
      );
      err.statusCode = 503;
      throw err;
    } else {
      return group.countDocuments({});
    }
  })
  .then((groupCount) => {
    if (groupCount !== 18) {
      const err = new Error(
        "database for periodic table element groups hasn't been initiated yet"
      );
      err.statusCode = 503;
      throw err;
    } else {
      let port = process.env.PORT;
      if (port == null || port == "") {
        port = 8000;
      }
      app.listen(port);
    }
  })
  .catch((error) => {
    if (!error) {
      error.statusCode = 503;
      error.message = "MongoDB service is unavailable";
    }
    logger.error(
      "app, an error happened while starting the server. the Error is ",
      error
    );
    mongoose.disconnect();
    process.exit(1);
  });
