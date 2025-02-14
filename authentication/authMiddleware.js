//authentication/authMiddleware.js

module.exports.isAuth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error", "You must be logged in to view this page.");
    res.redirect("/");
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.member_status === "admin") {
    next();
  } else {
    res.status(401).json({ message: "you are not authorized." });
  }
};
