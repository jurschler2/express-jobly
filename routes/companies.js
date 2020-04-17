/** Routes for companies */

const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const {BAD_REQUEST_STATUS, CREATED_STATUS} = require("../config");
const { validateCompany, validateUpdateCompany } = require("../middleware/companies.validation");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/authorizations");

/** Returns a list of JSON objects of existing companies by all, search, min, or max parameters */

router.get("/", ensureLoggedIn, async function(req, res, next) {

  try {

    if (req.query.search || req.query.min_employees || req.query.max_employees) {

      let search = req.query.search || '';
      let min = req.query.min_employees || 0;
      let max = req.query.max_employees || 2000000000;

      if (min > max) {
        throw new ExpressError(`Minimum must be lower than maximum: ${min} is not less than ${max}`, BAD_REQUEST_STATUS)
      }
      let companies = await Company.search(search, min, max);
      return res.json({companies});

    } else {

      let companies = await Company.all()
      return res.json({companies});

    }
  } catch(err) {
    return next(err);
  }

});

/** Returns a JSON object of an existing company & its jobs */

router.get("/:handle", ensureLoggedIn, async function(req, res, next) {

  try {
    let company = await Company.get(req.params.handle);
    return res.json({company})
  } catch(err) {
    return next(err);
  }

});

/** Add a company and validates against the company schema, and
 * return a JSON object of the added company               */

router.post("/", ensureAdmin, validateCompany, async function(req, res, next) {
  try {
    const company = await Company.create(req.body);
    return res.json({company}, CREATED_STATUS);

  } catch (err) {
    return next(err);
  }
});

/** Update/patch an existing company and validate against the update company schema then
 * return a JSON object of the updated/patched company                                 */

router.patch("/:handle", ensureAdmin, validateUpdateCompany, async function(req, res, next) {
  try {

    if (req.body.handle) {
      if (req.body.handle !== req.params.handle) {
        throw new ExpressError(`You cannot change the company's handle`, BAD_REQUEST_STATUS)
      }
    }

    if (Object.keys(req.body).length === 0) {
      throw new ExpressError(`You did not provide any updates`, BAD_REQUEST_STATUS)
    }

    const company = await Company.update(req.body, req.params.handle);
    return res.json({company});

  } catch (err) {
    return next(err);
  }
});

/** delete a company from the database and return a confirmation message */

router.delete("/:handle", ensureAdmin, async function(req, res, next) {

  try {

    const company = await Company.delete(req.params.handle);
    return res.json({message: `${company.handle} deleted`});

  } catch (err) {
    return next(err);
  }
});



module.exports = router;