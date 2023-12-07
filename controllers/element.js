const Element = require("../models/element");
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
  const { propertyName, recordLimit } = req.params;
  const propertyList = [
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
  if (!propertyList.includes(propertyName)) {
    const err = new Error(
      "could not find the following property: " + propertyName
    );
    err.statusCode = 404;
    throw err;
  }
  if (!(0 < recordLimit && recordLimit < 119)) {
    const err = new Error(
      "record limit must be between 1 to 118, passed record limit is : " +
        recordLimit
    );
    err.statusCode = 404;
    throw err;
  }

  Element.find({}, null)
    .select({ _id: 0, __v: 0 })
    .limit(recordLimit)
    .populate({
      path: "propertyId",
      modal: "Property",
      select: {
        // elementId: 0,
        _id: 0,
        // __v: 0,
        [propertyName]: 1,
      },
      // match: { [propertyName]: { $ne: "N/A" } },
      transform: (doc) => (doc[propertyName] === "N/A" ? null : doc),
    })
    .sort({ [propertyName]: -1 })
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
      const sortedElementArray = [];
      data.forEach((ele) => {
        const updatedElementroperty = JSON.parse(
          JSON.stringify(ele.propertyId)
        );
        sortedElementArray.push({
          name: ele.name,
          symbol: ele.symbol,
          atomicNumber: ele.atomicNumber,
          atomicMass: ele.atomicNumber,
          ...updatedElementroperty,
        });
      });
      res.status(200).json({
        message:
          "array of sorted elements with following property name " +
          propertyName +
          " and record limit " +
          recordLimit,
        data: sortedElementArray,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
