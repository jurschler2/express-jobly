process.env.NODE_ENV = "test";

const db = require("../../db");
const Company = require("../../models/company");
const request = require("supertest");
const app = require("../../app");
const {NOT_FOUND_STATUS,
       BAD_REQUEST_STATUS,
       OK_STATUS,
       CREATED_STATUS,
       SERVER_ERROR_STATUS} = require("../../config");


const testCompany1 = {
                        handle: "test",
                        name: "Test Name",
                        numEmployees: 10,
                        description: "Test description",
                        logoURL: "test.com"
                      };
const testCompany1Info = {
                        handle: "test",
                        name: "Test Name",
                        numEmployees: 10,
                        description: "Test description",
                        logoURL: "test.com"
                      };
const updateTestCompany1 = {
                        name: "New Test Name",
                        numEmployees: 50,
                        description: "Test description",
                        logoURL: "test.com"
                      };

const testCompany2 = {
                        handle: "test2",
                        name: "Test Company 2"
                      };


describe("Tests all Companies Routes", function () {
  beforeEach(async function() {

      await db.query(`DELETE FROM companies`);

      let company = await Company.create(testCompany1);

  });

  describe("GET /companies", function() {

    test("Can see all companies", async function() {

      const response = await request(app).get("/companies");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : [ {
                          handle: "test",
                          name: "Test Name",
                          numEmployees: 10,
                          description: "Test description",
                          logoURL: "test.com"
                        } ]
      });

    });

    test("Can search for something that exists and see correct results", async function() {

      const response = await request(app).get("/companies?search=test");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : [ {
                          handle: "test",
                          name: "Test Name"
                        } ]
      });

    });

    test("Can search for something that does not exist and see correct results", async function() {

      const response = await request(app).get("/companies?search=notreal");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        "companies" : []
      });

    });

    test("Can filter by a minimum number of employees and see correct results", async function() {

      const response = await request(app).get("/companies?min_employees=5");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : [ {
                          handle: "test",
                          name: "Test Name"
                        } ]
      });

    });

    test("Can filter by a minimum number of employees that is too high and see correct results", async function() {

      const response = await request(app).get("/companies?min_employees=50");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : []
      });

    });

    test("Can filter by a maximum number of employees and see correct results", async function() {

      const response = await request(app).get("/companies?max_employees=50");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : [ {
                          handle: "test",
                          name: "Test Name"
                        } ]
      });

    });

    test("Can filter by a maximum number of employees that is too low and see correct results", async function() {

      const response = await request(app).get("/companies?max_employees=5");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : []
      });

    });

    test("Can filter by a minimum and maximum number of employees and see correct results", async function() {

      const response = await request(app).get("/companies?min_employees=5&max_employees=50");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        companies : [ {
                          handle: "test",
                          name: "Test Name"
                        } ]
      });

    });

    test("Can filter by a minimum and maximum number of employees that is too constrained and see correct results", async function() {

      const response = await request(app).get("/companies?min_employees=5&max_employees=6");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
          companies : []
      });

    });

    test("Filtering by a minimum that is higher than a maximum yields an error", async function() {

      const response = await request(app).get("/companies?min_employees=50&max_employees=5");

      expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
      expect(response.body).toEqual({
         status : 400,
         message : "Minimum must be lower than maximum: 50 is not less than 5"
      });

    });

  });

  describe("GET /companies/:handle", function() {

    test("Can see a company", async function() {

      const response = await request(app).get("/companies/test");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        company : {
                      handle: "test",
                      name: "Test Name",
                      numEmployees: 10,
                      description: "Test description",
                      logoURL: "test.com"
                    }
      });

    });

    test("Will not see a company that does not exist", async function() {

      const response = await request(app).get("/companies/notreal");

      expect(response.statusCode).toBe(NOT_FOUND_STATUS);

    });

  });

  describe("POST /companies", function() {

    test("Can create a company", async function() {

      const response = await request(app).post("/companies").send(testCompany2);

      expect(response.statusCode).toBe(CREATED_STATUS);
      expect(response.body).toEqual({
        company : {
                      handle: "test2",
                      name: "Test Company 2",
                      description: null,
                      numEmployees: null,
                      logoURL: null
                    }
      });

    });

    test("Cannot create an already existing company", async function() {

      const response = await request(app).post("/companies").send(testCompany1);

      expect(response.statusCode).toBe(SERVER_ERROR_STATUS);
      
    });

  });

  describe("PATCH /companies/test", function() {

    test("Can update an existing company", async function() {

      const response = await request(app).patch("/companies/test").send(updateTestCompany1);

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        company : {
                      handle: "test",
                      name: "New Test Name",
                      description: "Test description",
                      logoURL: "test.com",
                      numEmployees: 50
                    }
      });

    });

    test("Cannot update a nonexistent company", async function() {

      const response = await request(app).patch("/companies/notreal").send(updateTestCompany1);

      expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
      expect(response.body).toEqual({
              status: 400,
              message: "Could not update company that does not exist: notreal"
      });
    });

  });

  describe("Delete /companies/test", function() {

    test("Can delete an existing company", async function() {

      const response = await request(app).delete("/companies/test");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual(
        {
          message: "test deleted"
        }
      );

    });

    test("Cannot delete a nonexistent company", async function() {

      const response = await request(app).delete("/companies/notreal");

      expect(response.statusCode).toBe(NOT_FOUND_STATUS);
      expect(response.body).toEqual({
              status: NOT_FOUND_STATUS,
              message: "No such company: notreal"
      });
    });

  });

});

afterAll(async function() {
  await db.end();
});

