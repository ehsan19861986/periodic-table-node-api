const elementModel = require("../models/element");
const { AVOGADRO_CONSTANT } = require("../constants");

exports.processPropertyList = function (propertyArray) {
  if (!propertyArray || propertyArray.length === 0) {
    const err = new Error(
      "property array in processPropertyList is either null or empty"
    );
    err.statusCode = 404;
    throw err;
  }
  const cleanPropertyArray = [];
  propertyArray.forEach((property) => {
    const clearedProperty = JSON.parse(JSON.stringify(property));
    const propertyElement = JSON.parse(JSON.stringify(property.elementId));
    cleanPropertyArray.push({
      ...propertyElement,
      ...clearedProperty,
      elementId: undefined,
    });
  });
  return cleanPropertyArray;
};

const processInnerCompound = function (compound, componentKey, quantity = 1) {
  if (
    Object.keys(componentKey).findIndex((element) =>
      compound.includes(element)
    ) > -1
  ) {
    let componentQuantityPattern = /[0-9]/;
    let componentLetterPattern = /.*[A-Za-z]|[\xe0-\uffff]/;
    let componentLetter = compound.match(componentLetterPattern)[0];
    let componentQuantity = compound.match(componentQuantityPattern);
    if (componentQuantity) {
      componentQuantity = componentQuantity[0];
    } else {
      componentQuantity = 1;
    }
    return processInnerCompound(
      componentKey[componentLetter],
      componentKey,
      componentQuantity * quantity
    );
  } else {
    let complexCompoundSectionTotalMass = 0;
    const compoundChunks = compound.split(/(?=[A-Z])/);
    const complexAtomicMassPromise = new Promise((resolve, reject) => {
      (async function () {
        for await (const element of compoundChunks) {
          if (!/\d/.test(element) && element.length > 2) {
            reject(
              "the following component is not a valid chemical element: " +
                element
            );
          } else {
            const elementAtomicMass = await isElementLegit(element, null);
            if (elementAtomicMass === -1) {
              reject(
                "the following component is not a valid chemical element: " +
                  element
              );
            }
            complexCompoundSectionTotalMass =
              complexCompoundSectionTotalMass + elementAtomicMass;
          }
        }
        resolve(complexCompoundSectionTotalMass * quantity);
      })();
    });
    return complexAtomicMassPromise
      .then((data) => {
        return data;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 404;
        }
        throw error;
      });
  }
};
const calculateAtomicMass = function (chemicalCompoundSlice, quantity) {
  return elementModel
    .find({ symbol: chemicalCompoundSlice })
    .select("-__v -_id -name -symbol")
    .populate({
      path: "propertyId",
      model: "Property",
      select: { _id: 0, atomicMass: 1 },
    })
    .exec()
    .then((data) => {
      if (!data) {
        return -1;
      }
      return data[0].propertyId.atomicMass * quantity;
    })
    .catch(() => {
      return -1;
    });
};
const isElementLegit = async function (compoundPiece, compoundKey) {
  let componentQuantityPattern = /[0-9]/;
  let componentLetterPattern = /.*[A-Za-z]|[\xe0-\uffff]/;
  let componentLetter = compoundPiece.match(componentLetterPattern)[0];
  let componentQuantity = compoundPiece.match(componentQuantityPattern);
  if (componentQuantity) {
    componentQuantity = componentQuantity[0];
  } else {
    componentQuantity = 1;
  }
  if (compoundKey) {
    if (Object.prototype.hasOwnProperty.call(compoundKey, componentLetter)) {
      return processInnerCompound(compoundPiece, compoundKey)
        .then((data) => {
          return data;
        })
        .catch(() => {
          return -1;
        });
    }
  }
  const mass = await calculateAtomicMass(componentLetter, componentQuantity);
  return mass;
};
const preprocessChemicalCompounds = function (compound) {
  if (
    compound.match(/[(]/) &&
    compound.split("(").length - 1 !== compound.split(")").length - 1
  ) {
    const error = new Error(
      "brackets do not match in the following compound: " + compound
    );
    error.statusCode = 404;
    throw error;
  } else if (!compound.match(/[(]/)) {
    return { restructuredCompound: compound };
  }
  const compoundComponents = {};
  let restructuredCompound = compound;
  let ind = 0;
  do {
    const mostNestedOpenBracket = restructuredCompound.lastIndexOf("(");
    const mostNestedCloseBracket = restructuredCompound.indexOf(")");
    const componentKey = String.fromCharCode(224 + ind);
    compoundComponents[String.fromCharCode(224 + ind)] =
      restructuredCompound.slice(
        mostNestedOpenBracket + 1,
        mostNestedCloseBracket
      );

    restructuredCompound = restructuredCompound.replace(
      restructuredCompound.slice(
        mostNestedOpenBracket,
        mostNestedCloseBracket + 1
      ),
      componentKey
    );
    ind++;
  } while (
    restructuredCompound.match(/[(]/) &&
    restructuredCompound.match(/[(]/).length > 0
  );
  return {
    restructuredCompound,
    compoundComponents,
  };
};

exports.processChemicalCompoundAtomicMass = function (chemicalCompound) {
  let totalAtomicMass = 0;
  const compoundObj = preprocessChemicalCompounds(chemicalCompound);
  const totalAtomicMassPromise = new Promise((resolve, reject) => {
    const restructuredCompoundChunks = compoundObj.restructuredCompound.split(
      /(?=[A-Z]|[\xe0-\uffff])/
    );
    (async function () {
      for await (const piece of restructuredCompoundChunks) {
        if (!/\d/.test(piece) && piece.length > 2) {
          reject(
            "the following component is not a valid chemical element: " + piece
          );
        } else {
          const elementAtomicMass = await isElementLegit(
            piece,
            compoundObj.compoundComponents
          );
          if (elementAtomicMass === -1) {
            reject(
              "the following component is not a valid chemical element: " +
                piece
            );
          }
          totalAtomicMass = totalAtomicMass + elementAtomicMass;
        }
      }
      resolve(totalAtomicMass);
    })();
  });
  return totalAtomicMassPromise
    .then((data) => {
      return data;
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      throw error;
    });
};

const generateComparisonMessage = function (sortedElectronAffinityList) {
  let comparisonMessage = "";
  sortedElectronAffinityList.forEach((element, index) => {
    comparisonMessage =
      comparisonMessage + `${index === 0 ? "" : " < "}` + element.symbol;
  });
  return comparisonMessage;
};

const compareElementElectronAffinity = function (elementOne, elementTwo) {
  if (elementOne.electronAffinity < elementTwo.electronAffinity) {
    return -1;
  } else if (elementOne.electronAffinity > elementTwo.electronAffinity) {
    return 1;
  }
  return 0;
};

const findInvalidElementSymbols = function (
  elementsWithElectronAffinity,
  elementsWithNoElectronAffinity,
  userElementInput
) {
  const invalidElementSymbol = [];
  const elementsWithAffinity = elementsWithElectronAffinity.map(
    (element) => element.symbol
  );
  userElementInput.forEach((input) => {
    if (
      !(
        elementsWithAffinity.includes(input) ||
        elementsWithNoElectronAffinity.includes(input)
      )
    ) {
      invalidElementSymbol.push(input);
    }
  });

  return invalidElementSymbol;
};
const isElectronAffinityComparisonPossible = function (
  elementsWithElectronAffinity,
  elementsWithNoElectronAffinity,
  userElementInput
) {
  const invalidSymbols = findInvalidElementSymbols(
    elementsWithElectronAffinity,
    elementsWithNoElectronAffinity,
    userElementInput
  );
  if (elementsWithElectronAffinity.length <= 1) {
    const error = new Error(
      `no result was found.${
        invalidSymbols.length > 0
          ? " All following element symbol inputs are invalid: " +
            invalidSymbols +
            "."
          : ""
      } ${
        elementsWithNoElectronAffinity.length > 0
          ? " All of following elements do not have electron Affinity: " +
            elementsWithNoElectronAffinity +
            "."
          : ""
      }`
    );
    error.statusCode = 422;
    throw error;
  }
  return invalidSymbols;
};
exports.processElementsElectronAffinity = function (
  elementsElectronAffinity,
  elementListInput
) {
  const processedElementElectronAffinity = [];
  const elementsWithNoElectronAffinity = [];
  elementsElectronAffinity.forEach((elementObj) => {
    if (elementObj.propertyId) {
      processedElementElectronAffinity.push({
        symbol: elementObj.symbol,
        electronAffinity: elementObj.propertyId.electronAffinity,
      });
    } else {
      elementsWithNoElectronAffinity.push(elementObj.symbol);
    }
  });
  const invalidElementSymbols = isElectronAffinityComparisonPossible(
    processedElementElectronAffinity,
    elementsWithNoElectronAffinity,
    elementListInput
  );
  const sortedElementElectronAffinity = processedElementElectronAffinity.sort(
    compareElementElectronAffinity
  );

  const sortedElementElectronAffinityStr = generateComparisonMessage(
    sortedElementElectronAffinity
  );
  return {
    sortedElementElectronAffinityStr,
    elementsWithNoElectronAffinity,
    invalidElementSymbols,
  };
};

exports.calculateOneAtomMass = function (data) {
  return data[0].propertyId.atomicMass / AVOGADRO_CONSTANT;
};
