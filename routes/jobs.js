/** Routes for jobs */

const express = require("express");
const Job = require("../models/job");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
// const jsonschema = require("jsonschema");
// const companySchema = require("../schemas/companySchema.json");
// const companyUpdateSchema = require("../schemas/companyUpdateSchema.json");
const {BAD_REQUEST_STATUS, CREATED_STATUS} = require("../config");

/** Returns a list of JSON objects of existing jobs by all, search, min parameters */

router.get("/", async function(req, res, next) {

  try {

    if (req.query.search || req.query.min_salary || req.query.min_equity) { 

      let search = req.query.search || '';
      let minSalary = req.query.min_salary || 0;
      let minEquity = req.query.min_equity || 0;

      if (minEquity > 1) {
        throw new ExpressError(`Minimum equity must be less than or equal to 1`, BAD_REQUEST_STATUS)
      }
      let jobs = await Job.search(search, minSalary, minEquity);
      return res.json({jobs});

    } else {

      let jobs = await Job.all()
      return res.json({jobs});

    }
  } catch(err) {
    return next(err);
  }

});



module.exports = router;