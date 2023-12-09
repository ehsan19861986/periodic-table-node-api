const Element = require("../models/element");
const { preprocessElementProperty } = require("../helpers/elementHelper");
exports.getElementBasedOnIndex = (req, res, next) => {
  const elementIndex = req.params.elementIndex;
  Element.findById(elementIndex)
    .select({ _id: 0, __v: 0 })
    .populate({
      path: "propertyId",
      modal: "Property",
      select: {
        elementId: 0,
        _id: 0,
        __v: 0,
      },
      transform: (doc) => (doc === null ? null : doc),
    })
    .then((element) => {
      if (!element) {
        const err = new Error(
          "could not find element with following index: " + elementIndex
        );
        err.statusCode = 404;
        throw err;
      }
      const { name, symbol, atomicNumber, atomicMass } = JSON.parse(
        JSON.stringify(element)
      );
      const updatedElementroperty = JSON.parse(
        JSON.stringify(element.propertyId)
      );

      res.status(200).json({
        message:
          "element at index: " + elementIndex + " of periodic table fetched.",
        element: {
          name,
          symbol,
          atomicNumber,
          atomicMass,
          ...updatedElementroperty,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
exports.getElementsOrderedByProperty = (req, res, next) => {
  const { propertyName, recordLimit, orderType } = req.params;
  const propertyList = [
    "atomicNumber",
    "atomicMass",
    "electronegativity",
    "atomicRadius",
    "ionizationEnergy",
    "electronAffinity",
    "meltingPoint",
    "boilingPoint",
    "density",
    "yearDiscovered",
  ];
  const validationError = [];
  if (!propertyList.includes(propertyName)) {
    validationError.push(
      "could not find the following property: " + propertyName
    );
  }
  if (!(0 < recordLimit && recordLimit < 119)) {
    validationError.push(
      "record limit must be between 1 to 118, passed record limit is : " +
        recordLimit
    );
  }
  const orderTypes = ["Asc", "Desc"];
  if (!orderTypes.includes(orderType)) {
    validationError.push(
      "order type must be either Asc or Desc, passed order type is : " +
        orderType
    );
  }
  if (validationError.length > 0) {
    const err = new Error(
      "getElementsOrderedByProperty api call is failed due to following error(s): \r\n " +
        validationError.join("\r\n")
    );
    err.statusCode = 404;
    throw err;
  }

  Element.find({}, null)
    .select({ _id: 0, __v: 0 })
    .populate({
      path: "propertyId",
      modal: "Property",
      select: {
        _id: 0,
        [propertyName]: 1,
      },
      match: { [propertyName]: { $ne: "N/A" } },
    })
    .exec()
    .then((result) => {
      if (!result) {
        const err = new Error(
          "could not find any result with following property name : " +
            propertyName +
            " and following record limit: " +
            recordLimit
        );
        err.statusCode = 404;
        throw err;
      }
      return result;
    })
    .then((data) => {
      return preprocessElementProperty(
        data,
        propertyName,
        recordLimit,
        orderType
      );
    })
    .then((result) => {
      if (!result || result.length === 0) {
        const err = new Error(
          "could not find any result with following property name : " +
            propertyName +
            " and following record limit: " +
            recordLimit
        );
        err.statusCode = 404;
        throw err;
      }
      return result;
    })
    .then((preparedElementArray) => {
      res.status(200).json({
        message:
          "array of sorted elements with following property name " +
          propertyName +
          " and record limit " +
          recordLimit,
        data: preparedElementArray,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getAncientElements = (req, res, next) => {
  Element.find({}, null)
    .select({ _id: 0, __v: 0 })
    .populate({
      path: "propertyId",
      modal: "Property",
      select: {
        _id: 0,
        __v: 0,
        yearDiscovered: 0,
      },
      match: { yearDiscovered: NaN },
    })
    .exec()
    .then((result) => {
      if (!result || result.length === 0) {
        const err = new Error(
          "could not find any result for querying ancient elements"
        );
        err.statusCode = 404;
        throw err;
      }
      const cleanElementArray = [];
      result.forEach((element) => {
        if (element.propertyId) {
          const elementProperty = JSON.parse(
            JSON.stringify(element.propertyId)
          );
          cleanElementArray.push({
            name: element.name,
            symbol: element.symbol,
            ...elementProperty,
          });
        }
      });
      res.status(200).json({
        message: "array of ancient elements",
        data: cleanElementArray,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
