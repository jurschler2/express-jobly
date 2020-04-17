const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const userUpdateSchema = require("../schemas/userUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { BAD_REQUEST_STATUS } = require("../config");

// validates data for creating a new user
function validateUser(req, res, next) {
  const result = jsonschema.validate(req.body, userSchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}


// validates data for updating an existing user
function validateUpdateUser(req, res, next) {
  const result = jsonschema.validate(req.body, userUpdateSchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}

module.exports = { validateUser, validateUpdateUser };