const Element = require("../models/element");
const {
  preprocessElementProperty,
  processElementNestedObject,
} = require("../helpers/elementHelper");
const { PROPERTY_LIST, ORDER_TYPE } = require("../constants");
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
      const { name, symbol } = JSON.parse(JSON.stringify(element));
      const updatedElementroperty = JSON.parse(
        JSON.stringify(element.propertyId)
      );

      res.status(200).json({
        message:
          "element at index: " + elementIndex + " of periodic table fetched.",
        element: {
          name,
          symbol,
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
  const validationError = [];
  if (!PROPERTY_LIST.includes(propertyName)) {
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

  if (!ORDER_TYPE.includes(orderType)) {
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
      res.status(200).json({
        message: "array of ancient elements",
        data: processElementNestedObject(result),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
exports.getalphabeticallyOrderedElements = (req, res, next) => {
  const { nameType, recordLimit, orderType } = req.params;
  const nameList = ["name", "symbol"];
  const validationError = [];
  if (!nameList.includes(nameType)) {
    validationError.push("could not find the following name type: " + nameType);
  }

  if (!(0 < recordLimit && recordLimit < 119)) {
    validationError.push(
      "record limit must be between 1 to 118, passed record limit is : " +
        recordLimit
    );
  }

  if (!ORDER_TYPE.includes(orderType)) {
    validationError.push(
      "order type must be either Asc or Desc, passed order type is : " +
        orderType
    );
  }
  if (validationError.length > 0) {
    const err = new Error(
      "getalphabeticallyOrderedElements api call is failed due to following error(s): \r\n " +
        validationError.join("\r\n")
    );
    err.statusCode = 404;
    throw err;
  }
  orderObj = { Asc: 1, Desc: -1 };
  if (orderType)
    Element.find({}, { [nameType]: 1, _id: 0 })
      .sort({ [nameType]: orderObj[orderType] })
      .limit(recordLimit)
      .then((response) => {
        if (!response || response.length === 0) {
          const err = new Error(
            "could not find any result for querying alphabetically ordered elements"
          );
          err.statusCode = 404;
          throw err;
        }
        res.status(200).json({
          message: "array of alphabetically-ordered elements",
          data: response,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
};

exports.getstandardStateBasedElements = (req, res, next) => {
  const { standardState } = req.params;
  const standardStateArray = ["Gas", "Solid", "Liquid"];
  if (!standardStateArray.includes(standardState)) {
    const err = new Error(
      "could not find any result for querying elements based on provided standard state  " +
        standardState
    );
    err.statusCode = 404;
    throw err;
  }
  Element.find({}, { _id: 0, __v: 0 })
    .populate({
      path: "propertyId",
      model: "Property",
      select: {
        _id: 0,
        standardState: 1,
      },
      match: { standardState: [standardState] },
    })
    .exec()
    .then((response) => {
      if (!response || response.length === 0) {
        const err = new Error(
          "could not find any result for querying standard state based elements"
        );
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message:
          "array of elements based on following standard state " +
          standardState,
        data: processElementNestedObject(response),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getElementsBasedOnGroupBlock = (req, res, next) => {
  const { groupBlock } = req.params;
  const groupTypes = [
    "Alkali metal",
    "Post-transition metal",
    "Transition metal",
    "Lanthanide",
    "Halogen",
    "Alkaline earth metal",
    "Nonmetal",
    "Noble gas",
    "Actinide",
    "Metalloid",
  ];
  if (!groupTypes.includes(groupBlock)) {
    const err = new Error(
      "could not find any result for querying elements based on provided group block  " +
        groupBlock
    );
    err.statusCode = 404;
    throw err;
  }
  Element.find({}, null)
    .populate({
      path: "propertyId",
      model: "Property",
      select: {
        _id: 0,
        groupBlock: 1,
      },
      match: { groupBlock: [groupBlock] },
    })
    .exec()
    .then((response) => {
      if (!response || response.length === 0) {
        const err = new Error(
          "could not find any result for querying elements based on provided group block " +
            groupBlock
        );
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message:
          "array of elements based on following group block " + groupBlock,
        data: processElementNestedObject(response),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
