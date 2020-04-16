process.env.NODE_ENV = "test";

const db = require("../../db");
const Job = require("../../models/job");
const Company = require("../../models/company")
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
const testJob1 = {
                    title: "test job title",
                    salary: 50000,
                    equity: .1,
                    company_handle: "test",
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


describe("Tests all Jobs Routes", function () {
  beforeEach(async function() {

      await db.query(`DELETE FROM companies`);
      await db.query(`DELETE FROM jobs`);

      let company = await Company.create(testCompany1);

      let job = await Job.create(testJob1);



  });

  describe("GET /jobs", function() {

    test("Can see all jobs", async function() {

      const response = await request(app).get("/jobs");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body.jobs[0].title).toEqual(testJob1.title);
      expect(response.body.jobs[0].company_handle).toEqual(testJob1.company_handle);

    });

    // test("Can search for something that exists and see correct results", async function() {

    //   const response = await request(app).get("/companies?search=test");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : [ {
    //                       handle: "test",
    //                       name: "Test Name"
    //                     } ]
    //   });

    // });

    // test("Can search for something that does not exist and see correct results", async function() {

    //   const response = await request(app).get("/companies?search=notreal");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     "companies" : []
    //   });

    // });

    // test("Can filter by a minimum number of employees and see correct results", async function() {

    //   const response = await request(app).get("/companies?min_employees=5");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : [ {
    //                       handle: "test",
    //                       name: "Test Name"
    //                     } ]
    //   });

    // });

    // test("Can filter by a minimum number of employees that is too high and see correct results", async function() {

    //   const response = await request(app).get("/companies?min_employees=50");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : []
    //   });

    // });

    // test("Can filter by a maximum number of employees and see correct results", async function() {

    //   const response = await request(app).get("/companies?max_employees=50");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : [ {
    //                       handle: "test",
    //                       name: "Test Name"
    //                     } ]
    //   });

    // });

    // test("Can filter by a maximum number of employees that is too low and see correct results", async function() {

    //   const response = await request(app).get("/companies?max_employees=5");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : []
    //   });

    // });

    // test("Can filter by a minimum and maximum number of employees and see correct results", async function() {

    //   const response = await request(app).get("/companies?min_employees=5&max_employees=50");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //     companies : [ {
    //                       handle: "test",
    //                       name: "Test Name"
    //                     } ]
    //   });

    // });

    // test("Can filter by a minimum and maximum number of employees that is too constrained and see correct results", async function() {

    //   const response = await request(app).get("/companies?min_employees=5&max_employees=6");

    //   expect(response.statusCode).toBe(OK_STATUS);
    //   expect(response.body).toEqual({
    //       companies : []
    //   });

    // });

    // test("Filtering by a minimum that is higher than a maximum yields an error", async function() {

    //   const response = await request(app).get("/companies?min_employees=50&max_employees=5");

    //   expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
    //   expect(response.body).toEqual({
    //      status : 400,
    //      message : "Minimum must be lower than maximum: 50 is not less than 5"
    //   });

    });

  });

  afterAll(async function() {
    await db.end();
  });
  