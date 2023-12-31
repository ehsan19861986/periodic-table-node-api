const {
  PROPERTY_LIST,
  ORDER_TYPE,
  AVOGADRO_CONSTANT,
} = require("../constants");
const property = require("../models/property");
const elementModel = require("../models/element");
const {
  processPropertyList,
  processChemicalCompoundAtomicMass,
  processElementsElectronAffinity,
  calculateOneAtomMass,
} = require("../helpers/propertyHelper");
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

// eslint-disable-next-line no-unused-vars
exports.getPropertiesMinMaxRange = (req, res, next) => {
  const propertyRangeList = [];
  const minMaxRangeProperties = new Promise((resolve) => {
    PROPERTY_LIST.forEach(async (prop, _index, array) => {
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
      next(error);
    });
};

exports.getElementsWithinPropertyRange = (req, res, next) => {
  const { propertyName, propertyRange, orderType } = req.params;
  const validationErrors = [];
  if (!PROPERTY_LIST.includes(propertyName)) {
    validationErrors.push(
      "could not find the following property: " + propertyName
    );
  }
  const propertyRangePattern = /[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/;
  if (!propertyRangePattern.test(propertyRange)) {
    validationErrors.push(
      "property range must be in Number-Number format, but the following was provided: " +
        propertyRange
    );
  }
  const providedRange = propertyRange
    .split("-")
    .map((range) => parseFloat(range));
  if (!(providedRange[0] < providedRange[1])) {
    validationErrors.push(
      "second arg for property range must be larger than first arg, but the following was provided: " +
        propertyRange
    );
  }
  if (!ORDER_TYPE.includes(orderType)) {
    validationErrors.push(
      "order type must be either Asc or Desc, passed order type is : " +
        orderType
    );
  }

  if (validationErrors.length > 0) {
    const error = new Error(
      "getElementsOrderedByProperty api call is failed due to following error(s): \r\n " +
        validationErrors.join("\r\n")
    );
    error.statusCode = 404;
    throw error;
  }
  const orderObj = { Asc: 1, Desc: -1 };
  property
    .find({
      [propertyName]: { $gte: providedRange[0], $lte: providedRange[1] },
    })
    .select(`${propertyName} -_id`)
    .populate({
      path: "elementId",
      model: "Element",
      select: "-_id -__v -propertyId",
    })
    .sort({ [propertyName]: orderObj[orderType] })
    .then((response) => {
      if (!response || response.length === 0) {
        const error = new Error(
          "could not find any result querying property collection based on property name: " +
            propertyName +
            " and property range: " +
            propertyRange
        );
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message:
          "elements for the following property name: " +
          propertyName +
          " within property range: " +
          propertyRange +
          " has been fetched.",
        data: processPropertyList(response),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getChemicalCompoundAtomicMass = (req, res, next) => {
  const { chemicalCompound } = req.params;
  const chemicalCompoundPattern =
    /[BCFHIKNOPSUVWY]|A[cglmrstu]|B[aehikr]|C[adefl-orsu]|D[bsy]|E[rsu]|F[elmr]|G[ade]|H[efgos]|I[nr]|Kr|L[airuv]|M[dgnot]|N[abdeiop]|Os|P[abdmortu]|R[abe-hnu]|S[bcegimnr]|T[abcehilm]|Uu[opst]|Xe|Yb|Z[nr]/;

  if (!chemicalCompoundPattern.test(chemicalCompound)) {
    const error = new Error(
      "chemical compound must be in correct format, but the following was provided: " +
        chemicalCompound
    );
    error.statusCode = 404;
    throw error;
  }
  chemicalCompound.split("").forEach((elementChar, index, array) => {
    if (elementChar === ")") {
      if (index + 1 <= array.length - 1) {
        if (!(array[index + 1] >= "0" && array[index + 1] <= "9")) {
          const error = new Error(
            "chemical compound must be in correct format, but the following was provided: " +
              chemicalCompound
          );
          error.statusCode = 404;
          throw error;
        }
      } else {
        const error = new Error(
          "chemical compound must be in correct format, but the following was provided: " +
            chemicalCompound
        );
        error.statusCode = 404;
        throw error;
      }
    }
  });
  processChemicalCompoundAtomicMass(chemicalCompound)
    .then((totalAtomicMass) => {
      res.status(200).json({
        message:
          "total atomic mass is calculated for following compound: " +
          chemicalCompound,
        data: totalAtomicMass,
      });
    })
    .catch((error) => {
      const err = new Error(error);
      err.statusCode = 422;
      next(err);
    });
};

exports.getElementInElectronAffinityOrdered = (req, res, next) => {
  const { elementList } = req.params;
  const parsedElementList = JSON.parse(JSON.stringify(elementList))
    .replace(" ", "")
    .split(",");
  if (!Array.isArray(parsedElementList) || parsedElementList.length <= 1) {
    const error = new Error(
      "an array must be provided, but the following was provided: " +
        parsedElementList
    );
    error.statusCode = 422;
    throw error;
  }
  const parsedElements = parsedElementList.map((element) =>
    element.split(" ").join("")
  );
  const elementSymbolPattern = /^[A-Z]{1}$|^[A-Z][a-z]$/;
  parsedElements.forEach((elementSymbol) => {
    if (elementSymbol === "" || !elementSymbolPattern.test(elementSymbol)) {
      const error = new Error(
        "a valid element symbol must be provided, but the following was provided: " +
          elementSymbol
      );
      error.statusCode = 422;
      throw error;
    }
  });

  elementModel
    .find({ symbol: { $in: parsedElements } })
    .select("-__v -_id -name")
    .populate({
      path: "propertyId",
      modal: "property",
      select: "electronAffinity -_id",
      match: { electronAffinity: { $ne: "N/A" } },
    })
    .exec()
    .then((data) => {
      if (!data || data.length === 0) {
        const error = new Error(
          "no result was found. all following element symbol inputs are invalid: " +
            parsedElements
        );
        error.statusCode = 422;
        throw error;
      }
      return processElementsElectronAffinity(data, parsedElements);
    })
    .then((result) => {
      const resObj = {
        message:
          "the comparison between provided user elements electron affinity is done.",
      };
      if (result.invalidElementSymbols.length > 0) {
        resObj["invalidElements"] =
          "the following provided element symbols by user are invalid: " +
          result.invalidElementSymbols;
      }
      if (result.elementsWithNoElectronAffinity.length > 0) {
        resObj["noElectronAffinityElements"] =
          "the following provided element symbols by user do not have electron affinity: " +
          result.elementsWithNoElectronAffinity;
      }
      resObj["comparisonResult"] = result.sortedElementElectronAffinityStr;
      res.status(200).json(resObj);
    })
    .catch((error) => {
      next(error);
    });
};

exports.getElementOneGramAtomMass = (req, res, next) => {
  let { elementSymbol } = req.params;
  elementSymbol = elementSymbol.replace(" ", "");
  const elementSymbolPattern = /^[A-Z]{1}$|^[A-Z][a-z]$/;
  let elementName = "";
  if (!elementSymbolPattern.test(elementSymbol)) {
    const error = new Error(
      "a valid element symbol must be provided, but the following was provided: " +
        elementSymbol
    );
    error.statusCode = 422;
    throw error;
  }
  elementModel
    .find({ symbol: elementSymbol })
    .select("-__v -_id")
    .populate({
      path: "propertyId",
      modal: "property",
      select: "atomicMass -_id",
      match: { atomicMass: { $ne: "N/A" } },
    })
    .exec()
    .then((data) => {
      if (!data || data.length === 0 || !data[0].propertyId) {
        const error = new Error(
          "no result was found. all following element symbol inputs are invalid: " +
            elementSymbol
        );
        error.statusCode = 422;
        throw error;
      }
      elementName = data[0].name;
      return calculateOneAtomMass(data);
    })
    .then((data) => {
      res.status(200).json({
        message: `mass of one atom of ${elementName} in gram is calculated.`,
        data,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getElementMoleToMass = (req, res, next) => {
  const { elementSymbol, moleAmount } = req.params;
  const elementSymbolPattern = /^[A-Z]{1}$|^[A-Z][a-z]$/;
  const moleAmountPattern = /^[+-]?\d+(\.\d+)?$/;
  if (!elementSymbolPattern.test(elementSymbol)) {
    const error = new Error(
      "a valid element symbol must be provided, but the following was provided: " +
        elementSymbol
    );
    error.statusCode = 422;
    throw error;
  }
  if (!moleAmountPattern.test(moleAmount)) {
    const error = new Error(
      "a valid mole amount must be provided, but the following was provided: " +
        moleAmount
    );
    error.statusCode = 422;
    throw error;
  }

  elementModel
    .find({ symbol: elementSymbol })
    .select("-__v -_id")
    .populate({
      path: "propertyId",
      modal: "property",
      select: "atomicMass -_id",
      match: { atomicMass: { $ne: "N/A" } },
    })
    .exec()
    .then((data) => {
      if (!data || data.length === 0 || !data[0].propertyId) {
        const error = new Error(
          "no result was found. all following element symbol inputs are invalid: " +
            elementSymbol
        );
        error.statusCode = 422;
        throw error;
      }
      return data;
    })
    .then((data) => {
      res.status(200).json({
        message:
          "mass of " +
          moleAmount +
          " mole of " +
          data[0].name +
          " in gram is calculated.",
        data: data[0].propertyId.atomicMass * moleAmount,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getElementMassToMole = (req, res, next) => {
  const { elementSymbol, amountInGrams } = req.params;
  const elementSymbolPattern = /^[A-Z]{1}$|^[A-Z][a-z]$/;
  const gramsAmountPattern = /^[+-]?\d+(\.\d+)?$/;
  if (!elementSymbolPattern.test(elementSymbol)) {
    const error = new Error(
      "a valid element symbol must be provided, but the following was provided: " +
        elementSymbol
    );
    error.statusCode = 422;
    throw error;
  }
  if (!gramsAmountPattern.test(amountInGrams)) {
    const error = new Error(
      "a valid amount in grams must be provided, but the following was provided: " +
        amountInGrams
    );
    error.statusCode = 422;
    throw error;
  }

  elementModel
    .find({ symbol: elementSymbol })
    .select("-__v -_id")
    .populate({
      path: "propertyId",
      modal: "property",
      select: "atomicMass -_id",
      match: { atomicMass: { $ne: "N/A" } },
    })
    .exec()
    .then((data) => {
      if (!data || data.length === 0 || !data[0].propertyId) {
        const error = new Error(
          "no result was found. all following element symbol inputs are invalid: " +
            elementSymbol
        );
        error.statusCode = 422;
        throw error;
      }
      return data;
    })
    .then((data) => {
      res.status(200).json({
        message:
          "mass of " +
          amountInGrams +
          " grams of " +
          data[0].name +
          " in mole is calculated.",
        data: amountInGrams / data[0].propertyId.atomicMass,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getElementMassToAtoms = (req, res, next) => {
  const { elementSymbol, amountInGrams } = req.params;
  const elementSymbolPattern = /^[A-Z]{1}$|^[A-Z][a-z]$/;
  const gramsAmountPattern = /^[+-]?\d+(\.\d+)?$/;
  if (!elementSymbolPattern.test(elementSymbol)) {
    const error = new Error(
      "a valid element symbol must be provided, but the following was provided: " +
        elementSymbol
    );
    error.statusCode = 422;
    throw error;
  }
  if (!gramsAmountPattern.test(amountInGrams)) {
    const error = new Error(
      "a valid amount in grams must be provided, but the following was provided: " +
        amountInGrams
    );
    error.statusCode = 422;
    throw error;
  }

  elementModel
    .find({ symbol: elementSymbol })
    .select("-__v -_id")
    .populate({
      path: "propertyId",
      modal: "property",
      select: "atomicMass -_id",
      match: { atomicMass: { $ne: "N/A" } },
    })
    .exec()
    .then((data) => {
      if (!data || data.length === 0 || !data[0].propertyId) {
        const error = new Error(
          "no result was found. all following element symbol inputs are invalid: " +
            elementSymbol
        );
        error.statusCode = 422;
        throw error;
      }
      return data;
    })
    .then((data) => {
      res.status(200).json({
        message:
          amountInGrams +
          " grams of " +
          data[0].name +
          " to number of its atoms is calculated.",
        data:
          (amountInGrams / data[0].propertyId.atomicMass) * AVOGADRO_CONSTANT,
      });
    })
    .catch((error) => {
      next(error);
    });
};
