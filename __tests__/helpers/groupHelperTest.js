const {
  processGroupElementList,
  processGroupName,
} = require("../../helpers/groupHelper");
const {
  groupElementList,
  groupNameLists,
} = require("../../dataMocks/helpers/groupHelperMock");

describe("processGroupElementList", () => {
  test("should throw error if group list input is empty", () => {
    expect(() => processGroupElementList([])).toThrow(
      "list of elements is null or empty"
    );
  });

  test("should return group elements list", () => {
    const groupElements = processGroupElementList(groupElementList);
    expect(groupElements).toHaveLength(6);
    expect(groupElements).toContain("Tennessine");
  });
});

describe("processGroupName", () => {
  test("throws error if groups list is null or empty", () => {
    expect(() => processGroupName([])).toThrow(
      "list of groups is null or empty"
    );
  });

  test("returns array of groups contains chemical group names only", () => {
    const groupNames = processGroupName(groupNameLists);
    expect(groupNames).toHaveLength(18);
    expect(groupNames).toContain("Group 11");
  });
});
