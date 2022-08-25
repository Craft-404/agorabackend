require("dotenv").config();
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const JWTSECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, JWTSECRET);
    const user = await Employee.findById(decoded._id);
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
