const express = require("express");

const elementController = require("../controllers/element");

const router = express.Router();

router.get(
  "/get-element-based-on-index/:elementIndex",
  elementController.getElementBasedOnIndex
);

router.get(
  "/get-elements-property-ordered/:propertyName&:recordLimit&:orderType",
  elementController.getElementsOrderedByProperty
);

router.get("/get-ancient-elements", elementController.getAncientElements);
router.get(
  "/get-alphabetically-ordered-elements/:nameType&:recordLimit&:orderType",
  elementController.getalphabeticallyOrderedElements
);

module.exports = router;
