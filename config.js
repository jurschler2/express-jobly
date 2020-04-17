/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "jobly-test";
} else {
  DB_URI = process.env.DATABASE_URL || "jobly";
}

const NOT_FOUND_STATUS = 404;
const BAD_REQUEST_STATUS = 400;
const OK_STATUS = 200;
const CREATED_STATUS = 201;
const SERVER_ERROR_STATUS = 500;
const BCRYPT_WORK_FACTOR = 12;
const UNAUTHORIZED_STATUS = 401;

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  NOT_FOUND_STATUS,
  BAD_REQUEST_STATUS,
  OK_STATUS,
  CREATED_STATUS,
  SERVER_ERROR_STATUS,
  BCRYPT_WORK_FACTOR,
  UNAUTHORIZED_STATUS
};
