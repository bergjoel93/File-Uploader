// controllers/indexController.js
//const genPassword = require("../lib/passwordUtils");

// Get Requests
function getIndex(req, res) {
  if (req.isAuthenticated()) {
    // redirect authenticated users to dashboard.
    return res.redirect(`/dashboard`);
  }

  // Render login page for unauthenticated users
  return res.render("layout", {
    title: "login",
    navbar: true,
    sidebar: false,
    body: "pages/login",
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
      return res.redirect("/"); // Redirect to login page
    });
  });
}

module.exports = {
  getIndex,
  getLogout,
};
