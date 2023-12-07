const express = require("express");

const elementController = require("../controllers/element");

const router = express.Router();

router.get(
  "/get-element-based-on-index/:elementIndex",
  elementController.getElementBasedOnIndex
);

router.get(
  "/get-elements-property-ordered/:propertyName&:recordLimit",
  elementController.getElementsOrderedByProperty
);
module.exports = router;
