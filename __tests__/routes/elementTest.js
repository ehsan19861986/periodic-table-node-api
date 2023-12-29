const app = require("../../server");
const request = require("supertest");
const { main } = require("../../database/DBConnection");
const mongoose = require("mongoose");

beforeAll(() => {
  main();
});
describe("GET /element/get-element-based-on-index", () => {
  test("should return hydrogen as first element of periodic table", async () => {
    const response = await request(app)
      .get("/element/get-element-based-on-index/1")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response._body.element.standardState).toEqual("Gas");
  });

  test("should return 500 if a non-digit alphabet is passed as query param", async () => {
    const response = await request(app)
      .get("/element/get-element-based-on-index/a")
      .set("Accept", "application/json");
    expect(response.status).toEqual(500);
    expect(response._body.message).toMatch(
      'Cast to Number failed for value "a" (type string) at path "_id" for model "Element"'
    );
  });

  test("should return 404 if a number provided out of 1-118 range", async () => {
    const response = await request(app)
      .get("/element/get-element-based-on-index/150")
      .set("Accept", "application/json");
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      "could not find element with following index: 150"
    );
  });
});

describe("GET /element/get-elements-property-ordered", () => {
  test("should return 404 if a ordertype expect Asc or Desc provided", async () => {
    const response = await request(app)
      .get("/element/get-elements-property-ordered/yearDiscovered&5&FakeOrder")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "order type must be either Asc or Desc, passed order type is : FakeOrder"
      )
    );
  });

  test("should return 404 if a recordLimit not within 1 to 118 provided", async () => {
    const response = await request(app)
      .get("/element/get-elements-property-ordered/yearDiscovered&0&Desc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "record limit must be between 1 to 118, passed record limit is : 0"
      )
    );
  });

  test("should return 404 if a valid property name is not provided", async () => {
    const response = await request(app)
      .get("/element/get-elements-property-ordered/unkown&5&Desc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining("could not find the following property: unkown")
    );
  });

  test("should return an array of 5 elements ordered based on yearDiscovered in descending order", async () => {
    const response = await request(app)
      .get("/element/get-elements-property-ordered/yearDiscovered&5&Desc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(5);
    expect(response._body.data).toContainEqual({
      name: "Tennessine",
      symbol: "Ts",
      yearDiscovered: 2010,
    });
  });
});

describe("GET /element/get-ancient-elements", () => {
  test("should return array of ancient elements", async () => {
    const response = await request(app)
      .get("/element/get-ancient-elements")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(13);
    expect(response._body.data).toContainEqual({
      name: "Carbon",
      symbol: "C",
      atomicNumber: 6,
      atomicMass: 12.011,
      standardState: "Solid",
      oxidationStates: "+4, +2, -4",
      electronegativity: 2.55,
      atomicRadius: 170,
      ionizationEnergy: 11.26,
      electronAffinity: 1.263,
      electronConfiguration: "[He]2s2 2p2",
      meltingPoint: 3823,
      boilingPoint: 4098,
      density: 2.267,
      groupBlock: "Nonmetal",
      elementId: 6,
    });
  });
});

describe("GET /element/get-standard-state-based-elements", () => {
  test("should return 404 if a valid standard state is not provided", async () => {
    const response = await request(app)
      .get("/element/get-standard-state-based-elements/unknown")
      .set("Accept", "application/json");
    expect(response.status).toEqual(404);
    expect(response._body.message).toMatch(
      "could not find any result for querying elements based on provided standard state  unknown"
    );
  });

  test("should return list of elements with a valid standard provided", async () => {
    const response = await request(app)
      .get("/element/get-standard-state-based-elements/Liquid")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(2);
    expect(response._body.data).toContainEqual({
      name: "Mercury",
      symbol: "Hg",
      standardState: "Liquid",
    });
  });
});

describe("GET /element/get-elements-based-on-group-block", () => {
  test("should return 404 if a valid group block is not provided", async () => {
    const response = await request(app)
      .get("/element/get-elements-based-on-group-block/unknown")
      .set("Accept", "application/json");
    expect(response.status).toEqual(404);
    expect(response._body.message).toMatch(
      "could not find any result for querying elements based on provided group block  unknown"
    );
  });

  test("should return list of elements with a valid standard provided", async () => {
    const response = await request(app)
      .get("/element/get-elements-based-on-group-block/Noble gas")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(7);
    expect(response._body.data).toContainEqual({
      name: "Radon",
      symbol: "Rn",
      groupBlock: "Noble gas",
    });
  });
});

describe("GET /element/get-alphabetically-ordered-elements", () => {
  test("should return 422 if a ordertype expect Asc or Desc provided", async () => {
    const response = await request(app)
      .get("/element/get-alphabetically-ordered-elements/name&5&FakeOrder")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "order type must be either Asc or Desc, passed order type is : FakeOrder"
      )
    );
  });

  test("should return 422 if a recordLimit not within 1 to 118 provided", async () => {
    const response = await request(app)
      .get("/element/get-alphabetically-ordered-elements/name&0&Desc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining(
        "record limit must be between 1 to 118, passed record limit is : 0"
      )
    );
  });

  test("should return 404 if a valid name type (either symbol or name) is not provided", async () => {
    const response = await request(app)
      .get("/element/get-alphabetically-ordered-elements/unknown&5&Desc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(422);
    expect(response._body.message).toEqual(
      expect.stringContaining("could not find the following name type: unknown")
    );
  });

  test("should return an array of 10 elements ordered in descending/Asending order", async () => {
    const response = await request(app)
      .get("/element/get-alphabetically-ordered-elements/symbol&10&Asc")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(10);
    expect(response._body.data).toContainEqual({
      symbol: "Ac",
    });
  });
});

afterAll(() => {
  mongoose.disconnect();
});
