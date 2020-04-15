/** Routes for companies */

const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");

/** Display list of companies */

router.get("/", async function(req, res, next) {

  try {

    if (req.query.search) {
      let companies = await Company.search(req.query.search);
      console.log(req.query.search)
      return res.json({companies});
    } else { 

      let companies = await Company.all();
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



module.exports = router;