/** Routes for companies */

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const {BAD_REQUEST_STATUS, CREATED_STATUS, SECRET_KEY, BCRYPT_WORK_FACTOR} = require("../config");
const { validateCompany, validateUpdateCompany } = require("../middleware/companies.validation");
const jwt = require("jsonwebtoken");

/** Logs in a user who provides a valid username and password combination
 * and returns a JSON web token                                           */

router.post("/login", async function(req, res, next) {
  
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {

        let adminStatus = await User.isAdmin(username);

        console.log("adminStatus:",adminStatus)
        //  give a token
        let payload = { username, adminStatus };  
        let token = jwt.sign(payload, SECRET_KEY);
        let verified = jwt.verify(token, SECRET_KEY);
        
        console.log("verified token", verified);
        // return token
        return res.json({ token });
    }else{
      throw new ExpressError("Invalid Username/Password", 400);
    }
  } 
  catch (err) {
    return next(err);
  } 
});


module.exports = router;