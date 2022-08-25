require("dotenv").config();
const User = require("../models/Employee");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const router = new express.Router();

router.post("/createmeet", auth, (req, res) => {
  console.log("route working");
});
