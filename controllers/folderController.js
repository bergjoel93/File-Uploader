// controllers/folderController.js

const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");

async function getFolder(req, res) {
  try {
    const folderId = req.params.folderId;
    const folderContents = await folderQuery.getFolderContents(folderId);
    // Fetch files in the folder
    const files = await fileQuery.getFilesInFolder(folderId);
    console.log("Folder Contents: ", folderContents);
    res.render("layout", {
      title: folderContents.folderName,
      navbar: true,
      sidebar: true,
      body: "pages/dashboard",
      type: "folder",
      contents: folderContents.contents,
      breadcrumbs: folderContents.breadcrumbs,
      folderId: folderContents.folderId,
      files,
    });
  } catch (err) {
    console.error("Error fetching folder", err);
    res.status(500).render("layout", {
      title: "Error",
      statusCode: "500",
      navbar: true,
      sidebar: true,
      body: "error",
      message:
        "It looks like there was an error fetching the folder you wanted.",
    });
  }
}

module.exports = { getFolder };
