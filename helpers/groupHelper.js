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
