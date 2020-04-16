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
const testJob1Response = testJob1;

const testJob2 = {
                    title: "test job2 title",
                    salary: 45000,
                    equity: .2,
                    company_handle: "test",
                  };
const testJob2Response = testJob2;

const testJob3 = {
                    title: "test job3 title",
                    salary: 45000,
                    equity: .2,
                    company_handle: "does not exist",
                  };
const testJob3Response = testJob3;

const updateTestJob1 = {
                          title: "Updated test1 job title",
                          salary: 77777,
                          equity: .1,
                        };

const updateTestJob2 = {
                          title: "Updated test1 job title",
                          salary: 77777,
                          equity: .1,
                          company_handle: "Does Not Exist",
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


let beforeEachJob;

describe("Tests all Jobs Routes", function () {
  beforeEach(async function() {

      await db.query(`DELETE FROM companies`);
      await db.query(`DELETE FROM jobs`);

      let company = await Company.create(testCompany1);

      beforeEachJob = await Job.create(testJob1);



  });

  describe("GET /jobs", function() {

    test("Can see all jobs", async function() {

      const response = await request(app).get("/jobs");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body.jobs[0].title).toEqual(testJob1.title);
      expect(response.body.jobs[0].company_handle).toEqual(testJob1.company_handle);

    });

    test("Can search for job by title and see correct results", async function() {

      const response = await request(app).get("/jobs?search=test");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        jobs : [testJob1Response]
      });

    });

    test("Can search for job that does not exist and see correct results", async function() {

      const response = await request(app).get("/jobs?search=notreal");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        "jobs" : []
      });

    });

    test("Can filter by a minimum salary and see correct results", async function() {

      const response = await request(app).get("/jobs?min_salary=50000");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        jobs : [testJob1Response]
      });

    });

    test("Can filter by a minimum equity and see correct results", async function() {

      const response = await request(app).get("/jobs?min_equity=.05");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        jobs : [testJob1Response]
      });

    });

    test("Can filter by a minimum equity that exceeds >= 1 constraint and see correct results", async function() {

      const response = await request(app).get("/jobs?min_equity=1.1");

      expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
    });

    test("Can filter by a title search, minimum salary, and minimum equity and see correct results", async function() {

      const response = await request(app).get("/jobs?search=test&min_salary=10000&min_equity=.02");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({
        jobs : [testJob1Response]
      });

    });

    });

    describe("GET /jobs/:id", function() {

      test("Can get a job by id", async function() {

        const response = await request(app).get(`/jobs/${beforeEachJob.id}`);

        expect(response.statusCode).toBe(OK_STATUS);
        expect(response.body.job.salary).toEqual(beforeEachJob.salary);
        expect(response.body.job.company_handle).toEqual(beforeEachJob.company_handle);

      });

      test("Will not see a job that does not exist", async function() {

        const response = await request(app).get("/jobs/99999999");

        expect(response.statusCode).toBe(NOT_FOUND_STATUS);

      });

    });

    describe("POST /jobs", function() {

      test("Can create a new job", async function() {

        const response = await request(app).post("/jobs").send(testJob2);

        expect(response.statusCode).toBe(CREATED_STATUS);
        expect(response.body.job.title).toEqual(testJob2Response.title);

      });

      test("Cannot create job for a company that does not exist", async function() {

        const response = await request(app).post("/jobs").send(testJob3);

        expect(response.statusCode).toBe(SERVER_ERROR_STATUS);

      });

    });

    describe("PATCH /jobs/:id", function() {

      test("Can update an existing job", async function() {

        const response = await request(app).patch(`/jobs/${beforeEachJob.id}`).send(updateTestJob1);

        expect(response.statusCode).toBe(OK_STATUS);
        expect(response.body.job.title).toEqual(updateTestJob1.title);
        expect(response.body.job.salary).toEqual(updateTestJob1.salary);

      });

      test("Cannot update job's company handle", async function() {

        const response = await request(app).patch(`/jobs/${beforeEachJob.id}`).send(updateTestJob2);

        expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
        expect(response.body).toEqual({
                status: 400,
                message: "You cannot update a job's company handle"
        });
      });

    });

    describe("Delete /jobs/:id", function() {

      test("Can delete an existing job", async function() {

        const response = await request(app).delete(`/jobs/${beforeEachJob.id}`);

        expect(response.statusCode).toBe(OK_STATUS);
        expect(response.body).toEqual(
          {
            message: `Job Id ${beforeEachJob.id} deleted`
          }
        );

      });

      test("Cannot delete a nonexistent job", async function() {

        const response = await request(app).delete(`/jobs/9999`)

        expect(response.statusCode).toBe(NOT_FOUND_STATUS);
        expect(response.body).toEqual({
                status: NOT_FOUND_STATUS,
                message: `No such job: 9999`
        });
      });

    });

  });

  afterAll(async function() {
    await db.end();
  });
