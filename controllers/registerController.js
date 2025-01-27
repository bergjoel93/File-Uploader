// controllers/registerController.js
const { validationResult } = require("express-validator");
const userQuery = require("../db/queries/user");
const { genPassword } = require("../authentication/passwordUtils");
// Get
function getRegister(req, res) {
  res.render("register", { errors: [] });
}

// Post
async function postRegister(req, res) {
  const { first_name, last_name, username, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Render the registration page with validation error messages
    return res.status(400).render("register", {
      errors: errors.array(),
      user: req.user,
    });
  }

  // add new user to databse
  try {
    // Registration logic here
    // 1. generate password
    const saltHash = genPassword(password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    // 2. Add new user into the database
    //  addUser(username, fulle_name, salt, hash,)
    const fullName =
      capitalizeFirst(first_name) + " " + capitalizeFirst(last_name);
    await userQuery.createUser(username, fullName, salt, hash);
    //console.log("New User: ", username, " was just added.");

    // 3. redirect
    res.render("login", {
      message: "Congrats! You've made an account!",
      errors: [],
      user: req.user,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res
      .status(500)
      .send("An error occurred during registration. Please try again.");
  }
}

function capitalizeFirst(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

module.exports = {
  getRegister,
  postRegister,
};
