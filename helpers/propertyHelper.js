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
