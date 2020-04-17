/** Routes for users */

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const { validateUser, validateUpdateUser } = require("../middleware/users.validation");
const {BAD_REQUEST_STATUS, CREATED_STATUS} = require("../config");

/** Returns a list of JSON objects of existing users */

router.get("/", async function(req, res, next) {

  try {

      let users = await User.all()
      return res.json({users});

    } catch(err) {
      return next(err);
    }

});

/**
 * This route should show information about a specific user.
 * It should return JSON of {user: userData}
 */

router.get("/:username", async function(req, res, next) {
  try {
    const username = req.params.username;
    const user = await User.get(username);

    return res.json({user});

  } catch(err) {
    return next(err);
  }
});

/**
 * This route creates a new user and returns JSON of {user: userData}
 */

router.post("/", validateUser, async function(req, res, next) {
  try {
    const user = await User.create(req.body);
    return res.json({user}, CREATED_STATUS);

  } catch (err) {
    return next(err);
  }
});

/**
 * This route updates a user by their username and returns the newly updated user.
 * It returns JSON of {user: userData}
 */

router.patch("/:username", validateUpdateUser, async function(req, res, next) {

  try {

    if (req.body.username) {
        throw new ExpressError(`You cannot update your username`, BAD_REQUEST_STATUS)
      }

    if (Object.keys(req.body).length === 0) {
      throw new ExpressError(`You did not provide any updates`, BAD_REQUEST_STATUS)
    }

    const user = await User.update(req.body, req.params.username);
    return res.json({user});

  } catch (err) {
    return next(err);
  }
});


/** DELETE /users/[username]
 * This route deletes a user and returns a message.
 * It returns JSON of { message: "user deleted" }
 */

router.delete("/:username", async function(req, res, next) {

  try {

    const user = await User.delete(req.params.username);
    return res.json({message: `User: ${user.username} deleted`});

  } catch (err) {
    return next(err);
  }
});





module.exports = router;