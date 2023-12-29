const compareElementProperty = function (propertyName, order) {
  if (order === "Asc") {
    return function (elementOne, elementTwo) {
      if (elementOne[propertyName] < elementTwo[propertyName]) {
        return -1;
      } else if (elementOne[propertyName] > elementTwo[propertyName]) {
        return 1;
      }
      return 0;
    };
  } else {
    return function (elementOne, elementTwo) {
      if (elementOne[propertyName] < elementTwo[propertyName]) {
        return 1;
      } else if (elementOne[propertyName] > elementTwo[propertyName]) {
        return -1;
      }
      return 0;
    };
  }
};

exports.preprocessElementProperty = function (
  elementList,
  propertyName,
  limit,
  orderType
) {
  if (!elementList || elementList.length === 0) {
    const err = new Error(
      "could not query any result from database for the following property name: " +
        propertyName
    );
    err.statusCode = 404;
    throw err;
  }
  const cleanedElementList = [];
  elementList.forEach((element) => {
    const updatedElementroperty = JSON.parse(
      JSON.stringify(element.propertyId)
    );
    if (
      updatedElementroperty &&
      Object.prototype.hasOwnProperty.call(
        updatedElementroperty,
        propertyName
      ) &&
      updatedElementroperty[propertyName]
    ) {
      cleanedElementList.push({
        name: element.name,
        symbol: element.symbol,
        ...updatedElementroperty,
      });
    }
  });
  return cleanedElementList
    .sort(compareElementProperty(propertyName, orderType))
    .slice(0, limit);
};

exports.processElementNestedObject = function (elementArray) {
  const cleanElementArray = [];
  elementArray.forEach((element) => {
    if (element.propertyId) {
      const elementProperty = JSON.parse(JSON.stringify(element.propertyId));
      cleanElementArray.push({
        name: element.name,
        symbol: element.symbol,
        ...elementProperty,
      });
    }
  });
  return cleanElementArray;
};
