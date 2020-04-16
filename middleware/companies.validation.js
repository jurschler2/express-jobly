const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const companyUpdateSchema = require("../schemas/companyUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { BAD_REQUEST_STATUS } = require("../config");


// validates data for creating a new company
function validateCompany(req, res, next) {
  const result = jsonschema.validate(req.body, companySchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}

// validates data for updating an existing company
function validateUpdateCompany(req, res, next) {
  const result = jsonschema.validate(req.body, companyUpdateSchema);
  if (!result.valid) {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, BAD_REQUEST_STATUS);

    return next(error);
  } else {
    return next();
  }
}

module.exports = { validateCompany, validateUpdateCompany };