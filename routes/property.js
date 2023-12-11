const express = require("express");
const propertyController = require("../controllers/property");
const router = express.Router();

router.get(
  "/get-min-max-element-property/:propertyName",
  propertyController.getMinMaxElementProperty
);

router.get(
  "/get-periodic-table-properties-range",
  propertyController.getPropertiesMinMaxRange
);

router.get(
  "/get-elements-within-range/:propertyName&:propertyRange&:orderType",
  propertyController.getElementsWithinPropertyRange
);
module.exports = router;
