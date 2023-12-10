const express = require("express");
const propertyController = require("../controllers/property");
const router = express.Router();

router.get(
  "/get-min-max-element-property/:propertyName",
  propertyController.getMinMaxElementProperty
);
module.exports = router;
