exports.getnonColumnWiseGroups = (req, res, next) => {
  res
    .status(200)
    .json({
      groups: [
        "Alkali metals",
        "Alkaline earth metals",
        "Transition metal",
        "Pnictogen",
        "Chalcogen",
        "Halogen",
        "Noble gas",
        "Lanthanide",
        "Actinide",
        "Rare-earth element",
        "Inner transition elements",
        "Main-group elements",
      ],
    });
};
