const express = require("express");

const elementController = require("../controllers/element");

const router = express.Router();

router.get(
  "/get-element-based-on-index/:elementIndex",
  elementController.getElementBasedOnIndex
);

module.exports = router;
