const Element = require("../models/element");
exports.getElementBasedOnIndex = (req, res, next) => {
  const elementIndex = req.params.elementIndex;
  Element.findById(elementIndex)
    .select({ _id: 0, __v: 0 })
    .populate({
      path: "propertyId",
      modal: "Property",
      select: {
        elementId: 0,
        _id: 0,
        __v: 0,
      },
      transform: (doc) => (doc === null ? null : doc),
    })
    .then((element) => {
      //console.log(element);
      if (!element) {
        const err = new Error(
          "could not find element with following index: " + elementIndex
        );
        err.statusCode = 404;
        throw err;
      }
      console.log(element.propertyId);
      const { name, symbol, atomicNumber, atomicMass } = JSON.parse(
        JSON.stringify(element)
      );
      const updatedElementroperty = JSON.parse(
        JSON.stringify(element.propertyId)
      );

      res.status(200).json({
        message:
          "element at index: " + elementIndex + " of periodic table fetched.",
        element: {
          name,
          symbol,
          atomicNumber,
          atomicMass,
          ...updatedElementroperty,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
