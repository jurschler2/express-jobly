/** Routes for jobs */

const express = require("express");
const Job = require("../models/job");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const { validateJob, validateUpdateJob } = require("../middleware/jobs.validation");
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

/**
 * This route should show information about a specific job including a key of company which is an object that contains all of the   * information about the company associated with it.
 * It should return JSON of {job: jobData}
 */

router.get("/:id", async function(req, res, next) {
  try {
    const id = req.params.id;
    const job = await Job.get(id);

    return res.json({job});

  } catch(err) {
    return next(err);
  }
});

/**
 * This route creates a new job and returns JSON of {job: jobData}
 */
router.post("/",validateJob, async function(req, res, next) {
  try {
    const job = await Job.create(req.body);
    return res.json({job}, CREATED_STATUS);

  } catch (err) {
    return next(err);
  }
});

/**
 * This route updates a job by its ID and returns an the newly updated job.
 * It returns JSON of {job: jobData}
 */

router.patch("/:id", validateUpdateJob, async function(req, res, next) {

  try {

    if (req.body.company_handle) {
        throw new ExpressError(`You cannot update a job's company handle`, BAD_REQUEST_STATUS)
      }

    if (Object.keys(req.body).length === 0) {
      throw new ExpressError(`You did not provide any updates`, BAD_REQUEST_STATUS)
    }

    const job = await Job.update(req.body, req.params.id);
    return res.json({job});

  } catch (err) {
    return next(err);
  }
});


/** DELETE /jobs/[id]
 * This route deletes a job and returns a message.
 * It returns JSON of { message: "Job deleted" }
 */

router.delete("/:id", async function(req, res, next) {

  try {

    const job = await Job.delete(req.params.id);
    return res.json({message: `Job Id ${job.id} deleted`});

  } catch (err) {
    return next(err);
  }
});



module.exports = router;