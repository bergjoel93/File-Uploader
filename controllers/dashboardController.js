// controllers/dashboardController.js
const folderQuery = require("../db/queries/folder");
// Get
async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    const rootContents = await folderQuery.getRootContents(userId);
    //console.log("roots content: ", rootContents);

    res.render("layout", {
      title: "Dashboard",
      navbar: true,
      sidebar: true,
      body: "pages/dashboard",
      type: "folder",
      contents: rootContents.contents,
      breadcrumbs: [{ name: "Root", folderId: null }], // Start breadcrumbs at Root
      folderId: rootContents.folderId,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Failed to load dashboard.");
  }
}

module.exports = { getDashboard };
