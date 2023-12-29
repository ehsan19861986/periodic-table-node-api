exports.processGroupElementList = function (groupList) {
  if (!groupList || groupList.length === 0) {
    const err = new Error("list of elements is null or empty");
    err.statusCode = 404;
    throw err;
  }
  const processedGroupList = [];
  groupList.forEach((element) => {
    processedGroupList.push(element?.elementId?.name);
  });
  return processedGroupList;
};

exports.processGroupName = function (groupArray) {
  if (!groupArray || groupArray.length === 0) {
    const error = new Error("list of groups is null or empty");
    error.statusCode = 404;
    throw error;
  }
  const processedGroupArray = [];
  groupArray.forEach((group) => {
    processedGroupArray.push(group.name);
  });
  return processedGroupArray;
};
