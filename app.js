const express = require("express");
const elementRoutes = require("./routes/element");
const groupRoutes = require("./routes/group");
const propertyRoutes = require("./routes/property");
const bodyParser = require("body-parser");
const element = require("./models/element");
const group = require("./models/group");
const property = require("./models/property");
const { main } = require("./database/DBConnection");
const logger = require("./winstonConfig");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/element", elementRoutes);
app.use("/group", groupRoutes);
app.use("/property", propertyRoutes);

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
      app.listen(8080);
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

app.use((error, req, res, next) => {
  const status = error.statusCode || 503;
  const message = error.message || "Service is not available at the moment";
  res.status(status).json({ status: status, message: message });
});
