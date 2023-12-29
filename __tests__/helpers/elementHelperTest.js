const {
  preprocessElementProperty,
  processElementNestedObject,
} = require("../../helpers/elementHelper");
const {
  elementListMock,
  elementNestedObjectList,
} = require("../../dataMocks/helpers/elementHelperMock");

describe("preprocessElementProperty", () => {
  test("throw error if element list is empty", () => {
    expect(() =>
      preprocessElementProperty([], "yearDiscovered", 10, "Asc")
    ).toThrow(
      "could not query any result from database for the following property name: yearDiscovered"
    );
  });

  test("should return a list of 5 elements, decending order based on year discovered", () => {
    const elementList = preprocessElementProperty(
      elementListMock,
      "yearDiscovered",
      5,
      "Desc"
    );
    expect(elementList).toHaveLength(5);
    expect(elementList[0]).toMatchObject({
      name: "Fermium",
      symbol: "Fm",
      yearDiscovered: 1952,
    });
  });
});

describe("processElementNestedObject", () => {
  test("should re-structure element nested objects returned from DB", () => {
    expect(processElementNestedObject(elementNestedObjectList)).toHaveLength(4);
  });
});
