process.env.NODE_ENV = "test";

const db = require("../../db");
const User = require("../../models/user");
const request = require("supertest");
const app = require("../../app");
const {NOT_FOUND_STATUS,
       BAD_REQUEST_STATUS,
       OK_STATUS,
       CREATED_STATUS,
       SERVER_ERROR_STATUS} = require("../../config");

const testUser1 = {
        username: "test",
        password: "password",
        first_name: "test first",
        last_name: "test last",
        email: "test@email.com",
        photo_url: "test.com/photo"
      };

const testUser1Response = testUser1;

const testUser2 = {
                    username: "test2",
                    password: "password",
                    first_name: "test2 first",
                    last_name: "test2 last",
                    email: "test2@email.com",
                    photo_url: "test2.com/photo"
                  };

const updateTestUser1 = {
  first_name: "New",
  last_name: "Name"
}

const updateTestUser2 = {
  first_name: "New",
  last_name: "Name",
  username: "anything"
}


let beforeEachUser;

describe("Tests all Users Routes", function () {
  beforeEach(async function() {

      await db.query(`DELETE FROM users`);
      beforeEachUser = await User.create(testUser1);
  });

  describe("GET /users", function() {

    test("Can see all users", async function() {

      const response = await request(app).get("/users");

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({users: [{
        username: "test",
        first_name: "test first",
        last_name: "test last",
        email: "test@email.com"
      }]})
    });

  });

  describe("GET /users/:username", function() {

    test("Can get a user by username", async function() {

      const response = await request(app).get(`/users/test`);

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual({user: {
        username: "test",
        first_name: "test first",
        last_name: "test last",
        email: "test@email.com",
        photo_url: "test.com/photo"
      }});

    });

    test("Will not see a user that does not exist", async function() {

      const response = await request(app).get("/users/notreal");

      expect(response.statusCode).toBe(NOT_FOUND_STATUS);

    });

  });

  describe("POST /users", function() {

    test("Can create a new user", async function() {

      const response = await request(app).post("/users").send(testUser2);

      expect(response.statusCode).toBe(CREATED_STATUS);
      expect(response.body).toEqual({user: {
        username: "test2",
        first_name: "test2 first",
        last_name: "test2 last",
        email: "test2@email.com",
        photo_url: "test2.com/photo"
      }});

    });

    test("Cannot create user for an already existing username", async function() {

      const response = await request(app).post("/users").send(testUser1);

      expect(response.statusCode).toBe(SERVER_ERROR_STATUS);

    });

  });

  describe("PATCH /users/:username", function() {

    test("Can update an existing user", async function() {

      const response = await request(app).patch(`/users/test`).send(updateTestUser1);

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body.user.first_name).toEqual(updateTestUser1.first_name);
      expect(response.body.user.last_name).toEqual(updateTestUser1.last_name);

    });

    test("Cannot update user's username", async function() {

      const response = await request(app).patch(`/users/test`).send(updateTestUser2);

      expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
    });

  });

  describe("Delete /users/:username", function() {

    test("Can delete an existing user", async function() {

      const response = await request(app).delete(`/users/test`);

      expect(response.statusCode).toBe(OK_STATUS);
      expect(response.body).toEqual(
        {
          message: `User: test deleted`
        }
      );

    });

    test("Cannot delete a nonexistent user", async function() {

      const response = await request(app).delete(`/users/notreal`)

      expect(response.statusCode).toBe(NOT_FOUND_STATUS);
    });

  });

});


afterAll(async function() {
  await db.end();
});