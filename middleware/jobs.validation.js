const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { BAD_REQUEST_STATUS } = require("../config");

// validates data for creating a new job
function validateJob(req, res, next) {
  const result = jsonschema.validate(req.body, jobSchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}


// validates data for updating an existing job
function validateUpdateJob(req, res, next) {
  const result = jsonschema.validate(req.body, jobUpdateSchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}

module.exports = { validateJob, validateUpdateJob };