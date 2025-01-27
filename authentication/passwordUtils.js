// authentication/passwordUtils.js
const crypto = require("crypto");

function genPassword(password) {
  // Generate a 32-byte random salt and convert it to a hexadecimal string
  var salt = crypto.randomBytes(32).toString("hex");
  // Generate a hash using the password and the salt

  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  // Return the salt and the generated hash
  return {
    salt: salt,
    hash: genHash,
  };
}

function validatePassword(password, hash, salt) {
  // Hash the provided password with the stored salt using the same parameters as genPassword
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  // Compare the newly generated hash with the stored hash
  return hash === hashVerify;
}

module.exports = {
  genPassword,
  validatePassword,
};
