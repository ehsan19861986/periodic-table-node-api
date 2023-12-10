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

exports.getPropertiesMinMaxRange = (req, res, next) => {
  const propertyRangeList = [];
  const minMaxRangeProperties = new Promise((resolve, reject) => {
    PROPERTY_LIST.forEach(async (prop, index, array) => {
      try {
        const minMaxRange = await property.aggregate([
          {
            $match: {
              [prop]: { $nin: ["N/A", NaN] },
            },
          },
          {
            $project: {
              [prop]: 1,
            },
          },
          {
            $group: {
              _id: {
                propertyName: prop,
              },
              avg: { $avg: `$${prop}` },
              max: { $max: `$${prop}` },
              min: { $min: `$${prop}` },
            },
          },
          {
            $project: {
              _id: 0,
              [prop]: {
                average: "$avg",
                max: "$max",
                min: "$min",
              },
            },
          },
        ]);
        if (prop === "yearDiscovered") {
          propertyRangeList.push({
            [prop]: {
              ...minMaxRange[0][prop],
              average: Math.floor(minMaxRange[0][prop].average),
            },
          });
        } else {
          propertyRangeList.push(minMaxRange[0]);
        }
        if (array.length === propertyRangeList.length) {
          resolve(propertyRangeList);
        }
      } catch (error) {
        if (!error) {
          error.statusCode = 500;
        }
        throw error;
      }
    });
  });
  minMaxRangeProperties
    .then((data) => {
      res.status(200).json({
        message:
          "average, minimum, and maximum values for all measurable periodic table properties are fetched",
        data,
      });
    })
    .catch(() => {
      const error = new Error(
        "error happened while aggregating min, max and average of measurable periodic table properties"
      );
      error.statusCode = 404;
      throw error;
    });
};
