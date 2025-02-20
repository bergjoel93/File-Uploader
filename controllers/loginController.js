const passport = require("passport");

function getLogin(req, res) {
  return res.render("login", {
    title: "login",
    errors: [],
    message: [],
  });
}

function getLogout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy(() => {
      return res.redirect("/login"); // Redirect to login page
    });
  });
}

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

module.exports = { getLogin, getLogout, postLogin };
