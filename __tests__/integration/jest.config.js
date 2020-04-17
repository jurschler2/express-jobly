const request = require("supertest");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../../app');
const db = require('../../db');
const TEST_DATA = {};

/** The beforeEachHook function manipulates the global test object to contain
 * relevant data for each test (token, etc.) and creates a basic test user,
 * company, and job */

async function beforeEachHook(TEST_DATA) {

  try {

    let hashedPassword = bcrypt.hash('password', 1);
    let userResult = await db.query(`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
                       VALUES ('testAdmin', 
                               ${hashedPassword},
                               'adminFirst', 
                               'adminLast', 
                               'admin@email.com', 
                               'admin.com/photo', 
                               'true')
                               RETURNING username, password
                              `);

    let adminUser = userResult.rows[0];
    const response = await (await request(app).post("/login")).send(adminUser);

    TEST_DATA.user.userToken = response.body.token;
    TEST_DATA.user.currentUsername = jwt.decode(TEST_DATA.userToken).username;
    TEST_DATA.user.currentAdminStatus = jwt.decode(TEST_DATA.userToken).adminStatus;

    // create a new test company
    const companyResult = await db.query(
      'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3) RETURNING *',
      ['test', 'Test Company', 1000]
    );

    TEST_DATA.currentCompany = companyResult.rows[0];

    // create a new test job
    const jobResult = await db.query(
      "INSERT INTO jobs (title, salary, company_handle) VALUES ('Software Engineer', 150000, $1) RETURNING *",
      [TEST_DATA.currentCompany.handle]
    );
    TEST_DATA.jobId = jobResult.rows[0].id;

  } catch (err) {

    console.log(err);
  }
}

async function afterEachHook() {
  try {
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM companies');
  } catch (error) {
    console.error(error);
  }
}

async function afterAllHook() {
  try {
    await db.end();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  afterAllHook,
  afterEachHook,
  TEST_DATA,
  beforeEachHook
};