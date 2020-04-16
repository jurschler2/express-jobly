/** Job for Jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const {BAD_REQUEST_STATUS, NOT_FOUND_STATUS} = require("../config");

/** Job */

class Job {

  /** find all jobs. */

  static async all() {
    const results = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle,
              date_posted
       FROM jobs
       ORDER BY title`
    );
    return results.rows;
  }

  /** get a job by id. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle,
              date_posted
       FROM jobs
       WHERE id = $1`,
      [id]
    );

    const job = results.rows[0];

    if (!job) {
      throw new ExpressError(`No such job: ${id}`, NOT_FOUND_STATUS);
    }

    return job;
  }


  /** create a job. */

  static async create({title, salary, equity, company_handle}) {


    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id ,title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );

    if (result.rows[0].length === 0) {
      throw new ExpressError(`Could not create job: ${title}`, BAD_REQUEST_STATUS);
    }

    return result.rows[0];
  }

  /** Searches the jobs in the database and returns jobs that contain
  *** the search string in name and/or by a min salary or min equity   */

 static async search(str, minSalary, minEquity) {

  const results = await db.query(
    `SELECT company_handle, title, salary, equity
     FROM jobs
     WHERE UPPER(title) LIKE $1 AND salary >= $2 AND equity >= $3
     ORDER BY company_handle, title`,
     [`%${str.toUpperCase()}%`, minSalary, minEquity]
  );
  return results.rows;

  }

  /** This function updates the company with correct parameters in the database
   * if it exists.  */

  static async update(body, id) {

  let table = 'jobs';
  let key = 'id';

  const {query, values} = sqlForPartialUpdate(table, body, key, id)

  let result = await db.query(`${query}`, values);

  if (result.rows[0] === undefined) {
    throw new ExpressError(`Could not update job that does not exist: ID: ${id} Title: ${body.title}`, BAD_REQUEST_STATUS);
  }

  return result.rows[0];
}

/** This function deletes an existing job */

static async delete(id) {

  await Job.get(id);

  const result = await db.query(`DELETE FROM jobs
                                 WHERE id = $1
                                 RETURNING id`,
                                 [id]);

    return result.rows[0];
  }

}

module.exports = Job;