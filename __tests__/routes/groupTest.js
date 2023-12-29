const app = require("../../server");
const request = require("supertest");
const { main } = require("../../database/DBConnection");
const mongoose = require("mongoose");

beforeAll(() => {
  main();
});
describe("GET /get-group-elements", () => {
  test("should return 404 if a valid group index within 1-18 range is not provided", async () => {
    const response = await request(app)
      .get("/group/get-group-elements/0")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      "could not find any result for querying groups based on provided group index  0"
    );
  });

  test("should return list of elements belong to a valid group index", async () => {
    const response = await request(app)
      .get("/group/get-group-elements/17")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(6);
    expect(response._body.data).toContain("Fluorine");
  });
});

describe("GET /get-group-names", () => {
  test("should return list of group names", async () => {
    const response = await request(app)
      .get("/group//get-group-names")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toHaveLength(18);
    expect(response._body.data).toContain("Group 13");
  });
});

describe("GET /get-group-description", () => {
  test("should return 404 if a valid group index within 1-18 range is not provided", async () => {
    const response = await request(app)
      .get("/group/get-group-description/19")
      .set("Accept", "application/json");
    expect(response.headers["content-type"]).toMatch(
      "application/json; charset=utf-8"
    );
    expect(response.status).toEqual(404);
    expect(response._body.message).toEqual(
      "could not find any result for querying groups based on provided group index  19"
    );
  });

  test("should return list of elements belong to a valid group index", async () => {
    const response = await request(app)
      .get("/group/get-group-description/9")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response._body.data).toMatch(
      "Group 9, by modern IUPAC numbering, is a group (column) of chemical elements in the d-block of the periodic table. These elements are among the rarest of the transition metals."
    );
  });
});

afterAll(() => {
  mongoose.disconnect();
});
