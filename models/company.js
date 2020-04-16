/** Company for Jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");

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

  static async get(handle) {
    const results = await db.query(
      `SELECT handle, 
              name,  
              num_employees AS "numEmployees", 
              description, 
              logo_url AS "logoURL"
      FROM companies WHERE handle = $1`,
      [handle]
    );

    const company = results.rows[0];

    if (results.rows.length === 0) {
      throw new ExpressError(`No such company: ${handle}`, 400);
    }

    return new Company(company);
  }

  /** create a company. */
  
  static async create({handle, name, numEmployees, description, logoURL}) {
    
    
    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees AS "numEmployees", description, logo_url AS "logoURL"`,
      [handle, name, numEmployees, description, logoURL]
    );

    if (result.rows[0].length === 0) {
      throw new ExpressError(`Could not create company: ${handle}`, 400);
    }

    return new Company(result.rows[0]);
  }

  /** Searches the companies in the database and returns companies who contain
  *** the search string in handle or name                                     */

 static async search(str) {

  const results = await db.query(
    `SELECT handle, name
     FROM companies
     WHERE UPPER(name) LIKE $1
     ORDER BY name`,
     [`%${str.toUpperCase()}%`]
  );
  return results.rows;

  }

/** Filters the companies in the database and returns companies who have 
*** employees within the given range.                                  */

 static async numEmployeesFilter(min, max) {

  const results = await db.query(
    `SELECT handle, name
     FROM companies
     WHERE num_employees BETWEEN $1 AND $2
     ORDER BY name`,
     [min, max]
  );
  return results.rows;

  }

  static async update({query, values}) {

    let handle = await Company.get(values[values.length - 1]);

    let result = await db.query(`${query}`, values);

    if (result.rows[0] === undefined) {
      const err = new ExpressError(`Could not update company that does not exist: ${handle}`, 400);
      throw err;
    }

    let company = await Company.get(result.rows[0].handle)

    return company;

  }

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