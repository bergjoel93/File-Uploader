const express = require("express");
const router = express.Router();
const passport = require("passport");

const { getIndex } = require("../controllers/indexController");
const {
  getRegister,
  postRegister,
} = require("../controllers/registerController");
const { getDashboard } = require("../controllers/dashboardController");

const { validateRegistration } = require("../validators/registrationValidator");
const { validateLogin } = require("../validators/loginValidation");

////////// GET ROUTES //////////////

router.get("/", getIndex);
router.get("/register", getRegister);
router.get("/", getIndex);
router.get("/dashboard", getDashboard);

////////// POST ROUTES //////////////
router.post("/register", validateRegistration, postRegister);
router.post(
  "/login",
  validateLogin,
  passport.authenticate("local", {
    failureRedirect: "/", // Redirect back to login page if authentication fails
    successRedirect: "/dashboard", // Redirect to dashboard on successful login
    failureFlash: true, // Show flash message on failure
  })
);

module.exports = router;
