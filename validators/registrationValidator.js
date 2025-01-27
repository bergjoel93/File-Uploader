// validators/registrationValidator.js

const { body } = require("express-validator");
const userQueries = require("../db/queries/user");

const validateRegistration = [
  // First Name Validation
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha("en-US", { ignore: " -" }) // Allows names with spaces or hyphens
    .withMessage("First name must contain only letters, spaces, or hyphens"),

  // Last Name Validation
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha("en-US", { ignore: " -" }) // Allows names with spaces or hyphens
    .withMessage("Last name must contain only letters, spaces, or hyphens"),

  // Username Validation
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers")
    .custom(async (value) => {
      const user = await userQueries.findUserByUsername(value); // Call userQueries method
      if (user) {
        throw new Error("Username is already taken");
      }
      return true;
    }),

  // Password Validation
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

module.exports = {
  validateRegistration,
};
