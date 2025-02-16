// controllers/folderController.js

const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");

async function getNewFolder(req, res) {
  const parentFolderId = req.params.parentFolderId;
  try {
    const parentFolder = await folderQuery.getFolderContents(parentFolderId);

    return res.render("layout", {
      title: "New Folder",
      navbar: false,
      sidebar: true,
      body: "pages/newFolder",
      parentFolderId,
      parentFolderName: parentFolder.folderName,
    });
  } catch (error) {
    console.error("There was an error:", error);
    return res.status(404).send("Folder not found.");
  }
}

async function createFolder(req, res) {
  try {
    const parentFolderId = req.params.parentFolderId;
    const { folderName } = req.body;
    const userId = req.user.id;
    const parentFolder = await folderQuery.getFolderContents(parentFolderId);
    //console.log("parent folder: ", parentFolder);

    // create the folder
    const newFolder = await folderQuery.createFolder(
      folderName,
      parentFolderId,
      userId
    );
    console.log(
      `New folder: ${folderName} was added to ${parentFolder.folderName}`
    );
    if (parentFolder.isRoot) {
      return res.redirect("/dashboard");
    } else {
      return res.redirect(`/dashboard/folder/${parentFolderId}`);
    }
  } catch (error) {
    console.error("Error creating new folder:", error);
    return res.status(500).send("Error creating new folder.");
  }
}

async function getFolder(req, res) {
  try {
    const folderId = req.params.folderId;
    const folderContents = await folderQuery.getFolderContents(folderId);
    // Fetch files in the folder
    const files = await fileQuery.getFilesInFolder(folderId);
    //console.log("Folder Contents: ", folderContents);
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

module.exports = { getFolder, createFolder, getNewFolder };
