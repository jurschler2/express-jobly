/** Routes for companies */

const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const companyUpdateSchema = require("../schemas/companyUpdateSchema.json");

/** Display list of companies */

router.get("/", async function(req, res, next) {

  try {

    if (req.query.search) {

      let companies = await Company.search(req.query.search);
      return res.json({companies});

    } else if (req.query.min_employees || req.query.max_employees) { 

      let min = req.query.min_employees || 0;
      let max = req.query.max_employees || 2000000000;

      if (min > max) {
        throw new ExpressError(`Minimum must be lower than maximum: ${min} is not less than ${max}`, 400)
      }
      let companies = await Company.numEmployeesFilter(min, max);
      return res.json({companies});

    } else {

      let companies = await Company.all()
      return res.json({companies});

    }
  } catch(err) {
    return next(err);
  }

});

/** Display a single company */

router.get("/:handle", async function(req, res, next) {

  try {
    let company = await Company.get(req.params.handle);
    return res.json({company})
  } catch(err) {
    return next(err);
  }

});

/** Add a company */

router.post("/", async function(req, res, next) {

  try {
    const result = jsonschema.validate(req.body, companySchema);

    if (!result.valid) {

      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const company = await Company.create(req.body);
    return res.json({company}, 201);

  } catch (err) {
    return next(err);
  }
});

/** Update a company */

router.patch("/:handle", async function(req, res, next) {

  try {

    const result = jsonschema.validate(req.body, companyUpdateSchema);

    if (!result.valid) {

      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    if (req.body.handle) {
      if (req.body.handle !== req.params.handle) {
        throw new ExpressError(`You cannot change the company's handle`, 400)
      }
    }

  
    if (Object.keys(req.body).length === 0) {
      throw new ExpressError(`You did not provide any updates`, 400)
    }

    let items = {};

    for (let k in req.body) {
      if (k === "numEmployees") {
        items["num_employees"] = req.body.numEmployees;
      } else if (k === "logoURL") {
        items["logo_url"] = req.body.logoURL;
      } else {
        items[k] = req.body[k];
      }
    }

    let table = 'companies';
    let key = 'handle';
    let companyHandle = req.params.handle;

    const update = sqlForPartialUpdate(table, items, key, companyHandle)
    const company = await Company.update(update);

    return res.json({company});

  } catch (err) {
    return next(err);
  }
});

/** delete a company */

router.delete("/:handle", async function(req, res, next) {

  try {
    
    const company = await Company.delete(req.params.handle);
    return res.json({message: `${company.handle} deleted`});

  } catch (err) {
    return next(err);
  }
});



module.exports = router;