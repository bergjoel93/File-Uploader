// controllers/registerController.js
const { validationResult } = require("express-validator");
const userQuery = require("../db/queries/user");
const folderQuery = require("../db/queries/folder");
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

    // 2. format fullName
    const fullName =
      capitalizeFirst(first_name) + " " + capitalizeFirst(last_name);

    // 3. Add new user into the database & get the user ID
    const newUser = await userQuery.createUser(username, fullName, salt, hash);
    console.log("New User Registered:", newUser.username);

    // 4. Automatically create a root folder for the new user
    //const existingRootFolder = await folderQuery.findRootFolder(newUser.id);

    await folderQuery.createRootFolder(newUser.id);
    console.log(`✅ Root folder created for user: ${newUser.username}`);

    // 5. redirect
    req.flash("message", "Account created successfully! Please log in.");
    res.redirect("/login"); // Redirects with flash message
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
