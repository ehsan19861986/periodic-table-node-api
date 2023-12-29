const app = require("../../server");
const request = require("supertest");
const { main } = require("../../database/DBConnection");
const mongoose = require("mongoose");

beforeAll(() => {
  main();
});

describe("GET /get-min-max-element-property", () => {
  test("should return 404 if a valid property name is not provided", async () => {
    const response = await request(app)
      .get("/property/get-min-max-element-property/unknown")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      "could not find the following property: unknown"
    );
  });

  test("should return list of elements that have minimum and maximum of a valid provided property name", async () => {
    const response = await request(app)
      .get("/property/get-min-max-element-property/boilingPoint")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data.min).toHaveProperty("name", "Helium");
  });
});

describe("GET /get-periodic-table-properties-range", () => {
  test("should return avg, min and max of all measurable properties", async () => {
    const response = await request(app)
      .get("/property/get-periodic-table-properties-range")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(10);
  });
});

describe("GET /get-elements-within-range", () => {
  test("should return 404 if invalid orderType is passed except Asc,Desc", async () => {
    const response = await request(app)
      .get("/property/get-elements-within-range/meltingPoint&1000-2000&unknown")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "order type must be either Asc or Desc, passed order type is : unknown"
      )
    );
  });

  test("should return 404 if invalid propertyName is passed", async () => {
    const response = await request(app)
      .get("/property/get-elements-within-range/unknown&1000-2000&Desc")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      expect.stringContaining("could not find the following property: unknown")
    );
  });

  test("should return 404 if invalid range is passed, except [number1-number2] && number1 < number2 format", async () => {
    const response = await request(app)
      .get("/property/get-elements-within-range/meltingPoint&2000-2000&Desc")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "second arg for property range must be larger than first arg, but the following was provided: 2000-2000"
      )
    );
  });

  test("should return elements with their property within the provided range ordered ascending or descending", async () => {
    const response = await request(app)
      .get("/property/get-elements-within-range/meltingPoint&100-200&Desc")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(3);
    expect(response._body.data).toContainEqual({
      name: "Krypton",
      symbol: "Kr",
      meltingPoint: 115.79,
    });
  });
});

describe("GET /get-chemical-compound-atomic-mass", () => {
  test("should return 404 if a valid compound is not provided", async () => {
    const response = await request(app)
      .get("/property/get-chemical-compound-atomic-mass/AgH3((CaH2)2)CH3")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      "chemical compound must be in correct format, but the following was provided: AgH3((CaH2)2)CH3"
    );
  });

  test("should return atomic mass of a valid compound", async () => {
    const response = await request(app)
      .get("/property/get-chemical-compound-atomic-mass/AgH3((CaH2)2)3CH3")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toEqual(378.503);
  });
});

describe("GET /get-elements-electron-affinity-based-ordered", () => {
  test("should return 422 if a valid list of elements is not passed", async () => {
    const response = await request(app)
      .get("/property/get-elements-electron-affinity-based-ordered/Ag")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "an array must be provided, but the following was provided: Ag"
    );
  });

  test("should return 422 if one or more elements are not in correct format (either single upper case or a upper case followed by lower case)", async () => {
    const response = await request(app)
      .get("/property/get-elements-electron-affinity-based-ordered/Ag,Ca,Afs")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid element symbol must be provided, but the following was provided: Afs"
    );
  });

  test("should return 422 if most of elements are not part of chemical periodic table or do not have electron affinity", async () => {
    const response = await request(app)
      .get("/property/get-elements-electron-affinity-based-ordered/Ag,Ca,Af")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "no result was found. All following element symbol inputs are invalid: Af.  All of following elements do not have electron Affinity: Ca."
    );
  });

  test("should return element comparison based on their electron affinity", async () => {
    const response = await request(app)
      .get("/property/get-elements-electron-affinity-based-ordered/Ag,O,F,Cl")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.comparisonResult).toEqual("Ag < O < F < Cl");
  });

  test("should return element comparison based on their electron affinity, also list of elements with no electron affinity or invalid elements", async () => {
    const response = await request(app)
      .get(
        "/property/get-elements-electron-affinity-based-ordered/Ag,O,F,Cl,Be,Ca,Aw"
      )
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.invalidElements).toEqual(
      "the following provided element symbols by user are invalid: Aw"
    );
    expect(response._body.noElectronAffinityElements).toEqual(
      "the following provided element symbols by user do not have electron affinity: Be,Ca"
    );
    expect(response._body.comparisonResult).toEqual("Ag < O < F < Cl");
  });
});

describe("GET /get-element-one-atom-mass", () => {
  test("should return 422 if a valid element is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-one-atom-mass/AgG")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid element symbol must be provided, but the following was provided: AgG"
    );
  });

  test("should return 422 if element does not exist on periodic table", async () => {
    const response = await request(app)
      .get("/property/get-element-one-atom-mass/Ss")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "no result was found. all following element symbol inputs are invalid: Ss"
    );
  });

  test("should return mass of one atom of a valid element", async () => {
    const response = await request(app)
      .get("/property/get-element-one-atom-mass/Ag")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toBeCloseTo(1.7911899746219694e-22, 42);
  });
});

describe("GET /get-element-mole-to-mass", () => {
  test("should return 422 if a valid element is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mole-to-mass/AgG&14")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid element symbol must be provided, but the following was provided: AgG"
    );
  });

  test("should return 422 if element does not exist on periodic table", async () => {
    const response = await request(app)
      .get("/property/get-element-mole-to-mass/Ab&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "no result was found. all following element symbol inputs are invalid: Ab"
    );
  });

  test("should return 422 if a valid mole amount in numbers is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mole-to-mass/Ag&NotNum")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid mole amount must be provided, but the following was provided: NotNum"
    );
  });
  test("should return mass of provided amount of moles of a valid element", async () => {
    const response = await request(app)
      .get("/property/get-element-mole-to-mass/Ag&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      "mass of 13.14 mole of Silver in gram is calculated."
    );
    expect(response._body.data).toBeCloseTo(1417.38552);
  });
});

describe("GET /get-element-mass-to-mole", () => {
  test("should return 422 if a valid element is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-mole/AgG&14")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid element symbol must be provided, but the following was provided: AgG"
    );
  });

  test("should return 422 if element does not exist on periodic table", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-mole/Ab&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "no result was found. all following element symbol inputs are invalid: Ab"
    );
  });

  test("should return 422 if a valid mole amount in numbers is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-mole/Ag&NotNum")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid amount in grams must be provided, but the following was provided: NotNum"
    );
  });
  test("should return mass of provided amount of moles of a valid element", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-mole/Ag&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      "mass of 13.14 grams of Silver in mole is calculated."
    );
    expect(response._body.data).toBeCloseTo(0.12181555234175104, 20);
  });
});

describe("GET /get-element-mass-to-atoms", () => {
  test("should return 422 if a valid element is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-atoms/AgG&14")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid element symbol must be provided, but the following was provided: AgG"
    );
  });

  test("should return 422 if element does not exist on periodic table", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-atoms/Ab&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "no result was found. all following element symbol inputs are invalid: Ab"
    );
  });

  test("should return 422 if a valid mole amount in numbers is not provided", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-atoms/Ag&NotNum")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      "a valid amount in grams must be provided, but the following was provided: NotNum"
    );
  });
  test("should return mass of provided amount of moles of a valid element", async () => {
    const response = await request(app)
      .get("/property/get-element-mass-to-atoms/Ag&13.14")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      "13.14 grams of Silver to number of its atoms is calculated."
    );
    expect(response._body.data).toBeCloseTo(7.335905284291912e22, 40);
  });
});

afterAll(() => {
  mongoose.disconnect();
});
