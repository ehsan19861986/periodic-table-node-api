const express = require("express");
const elementRoutes = require("./routes/element");
const groupRoutes = require("./routes/group");
const propertyRoutes = require("./routes/property");
const bodyParser = require("body-parser");
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

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const status = error.statusCode || 503;
  const message = error.message || "Service is not available at the moment";
  res.status(status).json({ status: status, message: message });
});

module.exports = app;
