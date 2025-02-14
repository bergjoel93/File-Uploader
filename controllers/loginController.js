const passport = require("passport");

function postLogin(req, res, next) {
  console.log("Login Attempt:", req.body); // Debug incoming request

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error in authentication:", err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.redirect("/"); // Or send an error message
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in:", err);
        return next(err);
      }

      //console.log("Login successful:", user);
      return res.redirect("/");
    });
  })(req, res, next); // This is critical to execute the Passport function
}

module.exports = { postLogin };
