// controllers/indexController.js
//const genPassword = require("../lib/passwordUtils");

// Get Requests
function getIndex(req, res) {
  if (req.isAuthenticated()) {
    // redirect authenticated users to dashboard.
    return res.render("/layout", {
      title: "Dashboard",
      navbar: true,
      sidebar: false,
      body: "./pages/dashboard",
    });
  }

  // Render login page for unauthenticated users
  res.render("login", { errors: [], message: [] });
}

module.exports = {
  getIndex,
};
