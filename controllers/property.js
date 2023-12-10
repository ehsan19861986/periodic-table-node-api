const { PROPERTY_LIST } = require("../constants");
const property = require("../models/property");
const { processPropertyList } = require("../helpers/propertyHelper");
exports.getMinMaxElementProperty = (req, res, next) => {
  const { propertyName } = req.params;
  if (!PROPERTY_LIST.includes(propertyName)) {
    const error = new Error(
      "could not find the following property: " + propertyName
    );
    error.statusCode = 404;
    throw error;
  }
  property
    .find({ [propertyName]: { $nin: ["N/A", NaN] } })
    .select("-_id -__v")
    .populate({
      path: "elementId",
      model: "Element",
      select: { _id: 0, propertyId: 0, __v: 0 },
    })
    .sort({ [propertyName]: 1 })
    .then((response) => {
      if (!response || response.length === 0) {
        const err = new Error(
          "could not find any result with following property " + propertyName
        );
        err.statusCode = 404;
        throw err;
      }
      const preparedPropertyList = processPropertyList([
        response[0],
        response[response.length - 1],
      ]);
      let data;
      if (preparedPropertyList.length === 1) {
        data = {
          min: preparedPropertyList[0],
          max: preparedPropertyList[0],
        };
      } else {
        data = {
          min: preparedPropertyList[0],
          max: preparedPropertyList[1],
        };
      }
      res.status(200).json({
        message:
          "elements with maximum and minimum value for following property " +
          propertyName +
          " has been fetched",
        data,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
