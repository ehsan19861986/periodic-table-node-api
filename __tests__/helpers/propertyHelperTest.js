const {
  processPropertyList,
  processElementsElectronAffinity,
  calculateOneAtomMass,
} = require("../../helpers/propertyHelper");

const { propertyList } = require("../../dataMocks/helpers/propertyHelperMock");

describe("processPropertyList", () => {
  test("should throw error if property list is empty or null", () => {
    expect(() => processPropertyList([])).toThrow(
      "property array in processPropertyList is either null or empty"
    );
  });

  test("should return processed property", () => {
    expect(processPropertyList(propertyList)[0].name).toBe("Helium");
  });
});

describe("calculateOneAtomMass", () => {
  test("should return mass of one atom", () => {
    const elementObj = [
      { name: "Carbon", symbol: "C", propertyId: { atomicMass: 12.011 } },
    ];
    expect(calculateOneAtomMass(elementObj)).toBeCloseTo(
      1.9944731324567503e-23,
      30
    );
  });
});

describe("processElementsElectronAffinity", () => {
  test("should throw error if almost all of provided element symbols are invalid or do not have electron affinity", () => {
    const elementList = ["Aa", "B", "Ca"];
    const elementsElectronAffinityList = [
      { symbol: "B", propertyId: { electronAffinity: 0.277 } },
      { symbol: "Ca", propertyId: null },
    ];

    expect(() =>
      processElementsElectronAffinity(elementsElectronAffinityList, elementList)
    ).toThrow(
      "no result was found. All following element symbol inputs are invalid: Aa.  All of following elements do not have electron Affinity: Ca."
    );
  });

  test("should return element comparison based on their electron affinity", () => {
    const elementList = ["O", "B", "F"];
    const elementsElectronAffinityList = [
      { symbol: "B", propertyId: { electronAffinity: 0.277 } },
      { symbol: "O", propertyId: { electronAffinity: 1.461 } },
      { symbol: "F", propertyId: { electronAffinity: 3.339 } },
    ];

    const result = processElementsElectronAffinity(
      elementsElectronAffinityList,
      elementList
    );
    expect(result.sortedElementElectronAffinityStr).toEqual("B < O < F");
    expect(result.elementsWithNoElectronAffinity).toHaveLength(0);
    expect(result.invalidElementSymbols).toHaveLength(0);
  });

  test("should return element comparison along with list of invalid elements or elements with no electron affinity", () => {
    const elementList = ["O", "B", "F", "Ca", "Aa"];
    const elementsElectronAffinityList = [
      { symbol: "B", propertyId: { electronAffinity: 0.277 } },
      { symbol: "O", propertyId: { electronAffinity: 1.461 } },
      { symbol: "F", propertyId: { electronAffinity: 3.339 } },
      { symbol: "Ca", propertyId: null },
    ];
    const result = processElementsElectronAffinity(
      elementsElectronAffinityList,
      elementList
    );
    expect(result.sortedElementElectronAffinityStr).toEqual("B < O < F");
    expect(result.elementsWithNoElectronAffinity).toContain("Ca");
    expect(result.invalidElementSymbols).toContain("Aa");
  });
});
