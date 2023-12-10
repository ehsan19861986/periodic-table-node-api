const group = require("../models/group");
const { processGroupElementList } = require("../helpers/groupHelper");
exports.getGroupElements = (req, res, next) => {
  const { groupIndex } = req.params;

  if (!(0 < groupIndex && groupIndex < 18)) {
    const err = new Error(
      "could not find any result for querying groups based on provided group name  " +
        groupName
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
        message: "elements for grou name " + groupName + " has been fetched",
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
