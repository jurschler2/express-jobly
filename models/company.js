/** Company for Jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const {BAD_REQUEST_STATUS, NOT_FOUND_STATUS} = require("../config");

/** Company */

class Company {
  constructor({ handle, name, numEmployees, description, logoURL }) {
    this.handle = handle;
    this.name = name;
    this.numEmployees = numEmployees;
    this.description = description;
    this.logoURL = logoURL;
  }

  /** find all companies. */

  static async all() {
    const results = await db.query(
      `SELECT handle,
         name,
         num_employees AS "numEmployees",
         description,
         logo_url AS "logoURL"
       FROM companies
       ORDER BY handle`
    );
    return results.rows.map(c => new Company(c));
  }

  /** get a company by handle. */

  // static async get(handle) {
  //   const results = await db.query(
  //     `SELECT handle,
  //             name,
  //             num_employees AS "numEmployees",
  //             description,
  //             logo_url AS "logoURL"
  //     FROM companies WHERE handle = $1`,
  //     [handle]
  //   );

  //   const company = results.rows[0];

  //   if (results.rows.length === 0) {
  //     throw new ExpressError(`No such company: ${handle}`, NOT_FOUND_STATUS);
  //   }

  //   return new Company(company);
  // }

  /** gets a company by handle and returns company data and jobs. */

//   Update the following routes:

// GET /companies/[handle]
// This should return a single company found by its id. It should also return a key of jobs which is an array of jobs that belong to that company: {company: {...companyData, jobs: [job, ...]}}

  static async get(company_handle) {
    const results = await db.query(
      `SELECT c.handle,
              c.name,
              c.num_employees AS "numEmployees",
              c.description,
              c.logo_url AS "logoURL",
              j.id,
              j.title,
              j.salary,
              j.equity,
              j.date_posted
      FROM companies AS c
      LEFT JOIN jobs AS j
      ON c.handle = j.company_handle
      WHERE c.handle = $1`,
      [company_handle]
    );

    const companyWithJobs = results.rows;

    if (results.rows.length === 0) {
      throw new ExpressError(`No such company: ${company_handle}`, NOT_FOUND_STATUS);
    }

    let {name, handle, numEmployees, description, logoURL} = companyWithJobs[0];
    let jobData = companyWithJobs.map(item => ({
                id: item.id,
                title: item.title,
                salary: item.salary,
                equity: item.equity,
                date_posted: item.date_posted})
    );

    return {name, handle, numEmployees, description, logoURL, jobs: jobData};

  };

  /** create a company. */

  static async create({handle, name, numEmployees, description, logoURL}) {


    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees AS "numEmployees", description, logo_url AS "logoURL"`,
      [handle, name, numEmployees, description, logoURL]
    );

    if (result.rows[0].length === 0) {
      throw new ExpressError(`Could not create company: ${handle}`, BAD_REQUEST_STATUS);
    }

    return new Company(result.rows[0]);
  }

  /** Searches the companies in the database and returns companies who contain
  *** the search string in name and/or by a min or max of employees             */

 static async search(str, min, max) {

  const results = await db.query(
    `SELECT handle, name
     FROM companies
     WHERE UPPER(name) LIKE $1 AND num_employees BETWEEN $2 AND $3
     ORDER BY name`,
     [`%${str.toUpperCase()}%`, min, max]
  );
  return results.rows;

  }

  /** This function updates the company with correct parameters in the database
   * if it exists.  */

  static async update(body, handle) {

      // There are two attributes on the Company class in camelCase but snake_case
    // in the database and need to be converted before sent to the sqlForPartialUpdate
    // function due to the way it constructs the SQL query.

    let items = {};

    for (let k in body) {
      if (k === "numEmployees") {
        items["num_employees"] = body.numEmployees;
      } else if (k === "logoURL") {
        items["logo_url"] = body.logoURL;
      } else {
        items[k] = body[k];
      }
    }

    let table = 'companies';
    let key = 'handle';

    const {query, values} = sqlForPartialUpdate(table, items, key, handle)

    let result = await db.query(`${query}`, values);

    if (result.rows[0] === undefined) {
      throw new ExpressError(`Could not update company that does not exist: ${handle}`, BAD_REQUEST_STATUS);
    }

    let company = await Company.get(result.rows[0].handle)
    return company;
  }

  /** This function deletes an existing company */

  static async delete(handle) {

    let company = await Company.get(handle);

    const result = await db.query(`DELETE FROM companies
                                   WHERE handle = $1
                                   RETURNING handle`,
                                   [company.handle]);

      return result.rows[0];
    }

}


module.exports = Company;