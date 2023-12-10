const express = require("express");
const groupController = require("../controllers/group");
const router = express.Router();

router.get("/get-group-elements/:groupIndex", groupController.getGroupElements);
router.get(
  "/get-group-description/:groupIndex",
  groupController.getGroupDescription
);

module.exports = router;
