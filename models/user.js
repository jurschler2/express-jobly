/** User for Jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const {BAD_REQUEST_STATUS, NOT_FOUND_STATUS} = require("../config");

/** User */

class User {

  /** find all users. */

  static async all() {
    const results = await db.query(
      `SELECT username,
              first_name,
              last_name,
              email
       FROM users
       ORDER BY last_name, first_name, username`
    );
    return results.rows;
  }

  /** get a user by id. */

  static async get(username) {
    const results = await db.query(
      `SELECT username,
              first_name,
              last_name,
              email,
              photo_url
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = results.rows[0];

    if (!user) {
      throw new ExpressError(`No such user: ${username}`, NOT_FOUND_STATUS);
    }

    return user;
  }


  /** create a user. */

  static async create({username, password, first_name, last_name, email, photo_url}) {

    // To import bcrypt and hash password
    let hashedPassword = password;

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, password, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );

    const user = result.rows[0];

    if (!user) {
      throw new ExpressError(`Could not create user: ${username}`, BAD_REQUEST_STATUS);
    }

    return user;
  }

  /** This function updates the user with correct parameters in the database
   * if they exist.  */

  static async update(body, username) {

    let table = 'users';
    let key = 'username';
  
    const {query, values} = sqlForPartialUpdate(table, body, key, username)
  
    let result = await db.query(`${query}`, values);

    let user = result.rows[0];
  
    if (!user) {
      throw new ExpressError(`Could not update user that does not exist: ${username}`, BAD_REQUEST_STATUS);
    }
  
    return user;
  }
  
  /** This function deletes an existing user */
  
  static async delete(username) {
  
    await User.get(username);
  
    const result = await db.query(`DELETE FROM users
                                   WHERE username = $1
                                   RETURNING username`,
                                   [username]);
  
    return result.rows[0];
    }

}

module.exports = User;