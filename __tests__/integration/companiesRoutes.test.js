process.env.NODE_ENV = "test";

const db = require("../../db");
const Company = require("../../models/company");
const request = require("supertest");
const app = require("../../app");


describe("Tests all Companies Routes", function () {
  beforeEach(async function() {

      await db.query(`DELETE FROM companies`);

      let company = await Company.create('test', 'Test Name', 10, 'Test description', 'test.com');

  });

  describe("GET /companies", function() {

    test("Can see all companies", async function() {

      const response = await request(app).get("/companies");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "companies" : [ {
                          "handle": "test",
                          "name": "Test Name",
                          "numEmployees": 10,
                          "description": "Test description",
                          "logoURL": "test.com"
                        } ]
      });

    });

  });

  describe("GET /companies/:handle", function() {

    test("Can see a company", async function() {

      const response = await request(app).get("/companies/test");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "company" : {
                      "handle": "test",
                      "name": "Test Name",
                      "numEmployees": 10,
                      "description": "Test description",
                      "logoURL": "test.com"
                    }
      });

    });
    test("Will not see a company that does not exist", async function() {

      const response = await request(app).get("/companies/notreal");

      expect(response.statusCode).toBe(404);

    });

  });



});

afterAll(async function() {
  await db.end();
});

