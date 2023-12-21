const elementModel = require("../models/element");

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
    .catch((error) => {
      return -1;
    });
};
const isElementLegit = async function (compoundPiece, compoundKey) {
  if (compoundPiece.split(/(?=[A-Z]|[\xe0-\uffff])/)) {
  }
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
    if (compoundKey.hasOwnProperty(componentLetter)) {
      return processInnerCompound(compoundPiece, compoundKey)
        .then((data) => {
          return data;
        })
        .catch((error) => {
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
    mostNestedOpenBracket = restructuredCompound.lastIndexOf("(");
    mostNestedCloseBracket = restructuredCompound.indexOf(")");
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
