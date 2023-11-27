const express = require("express");

const elementRoutes = require("./routes/element");
const bodyParser = require("body-parser");
const DBConnection = require("./database/DBConnection");
const {initChemicalPeriodicTableDB} = require('./database/setupDB')
const app = express();
initChemicalPeriodicTableDB();
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

DBConnection.main()
  .then((result) => {
    app.listen(8080);
  })
  .catch((error) => {
    if (!error.statusCode) {
      error.statusCode = 503;
    }
    error.message = "MongoDB service is unavailable";
    console.log(error)
  });

app.use((error, req, res, next) => {
  const status = error.statusCode || 503;
  const message = error.message || "Service is not available at the moment";
  res.status(status).json({ status: status, message: message });
});
