// controllers/indexController.js
//const genPassword = require("../lib/passwordUtils");
const folderQuery = require("../db/queries/folder");
// Get Requests
async function getIndex(req, res) {
  if (!req.isAuthenticated()) {
    // redirect authenticated users to dashboard.
    return res.redirect(`/login`);
  }
  // get user Id
  const userId = req.user.id;
  const rootContents = await folderQuery.getRootContents(userId);

  // Render main drive page "/"
  return res.render("layout", {
    title: "Root Folder",
    navbar: true,
    body: "pages/root",
    contents: rootContents.contents,
    folderId: rootContents.folderId,
  });
}

module.exports = {
  getIndex,
};
