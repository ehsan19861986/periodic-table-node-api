const group = require("../models/group");
const {
  processGroupElementList,
  processGroupName,
} = require("../helpers/groupHelper");
exports.getGroupElements = (req, res, next) => {
  const { groupIndex } = req.params;

  if (!(0 < groupIndex && groupIndex < 18)) {
    const err = new Error(
      "could not find any result for querying groups based on provided group index  " +
        groupIndex
    );
    err.statusCode = 404;
    throw err;
  }
  const groupName = "Group " + groupIndex;
  group
    .find({ name: [groupName] })
    .select(
      "-_id -__v -name -description -listOfElements.symbol -listOfElements._id"
    )
    .populate({
      path: "listOfElements.elementId",
      model: "Element",
      select: {
        name: 1,
        _id: 0,
      },
    })
    .exec()
    .then((response) => {
      if (!response || response.length === 0) {
        const err = new Error(
          "could not find any results querying group collection for the following group name " +
            groupName
        );
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "elements for group name " + groupName + " has been fetched",
        data: processGroupElementList(response[0]?.listOfElements),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getGroupDescription = (req, res, next) => {
  const { groupIndex } = req.params;
  if (!(0 < groupIndex && groupIndex < 18)) {
    const error = new Error(
      "could not find any result for querying groups based on provided group index  " +
        groupIndex
    );
    error.statusCode = 404;
    throw error;
  }
  const groupName = "Group " + groupIndex;
  group
    .find({ name: [groupName] })
    .select("description -_id")
    .then((response) => {
      if (!response || response.length === 0) {
        const error = new Error(
          "could not find any result for querying groups based on provided group name " +
            groupName
        );
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message:
          "description for group name " + groupName + " has been fetched",
        data: response[0]?.description,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getGroupNames = (req, res, next) => {
  group
    .find({})
    .select("name -_id")
    .then((response) => {
      if (!response || response.length === 0) {
        const err = new Error("could not find any result for querying groups");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "group names has been fetched",
        data: processGroupName(response),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
