const express = require("express");

const elementController = require("../controllers/element");

const router = express.Router();

router.get("/non-columnwise-groups", elementController.getnonColumnWiseGroups);

module.exports = router;
