// controllers/folderController.js

const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");

async function getNewFolder(req, res) {
  const parentFolderId = req.params.parentFolderId;
  try {
    const parentFolder = await folderQuery.getFolderContents(parentFolderId);

    return res.render("layout", {
      title: "New Folder",
      navbar: true,
      sidebar: false,
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
      sidebar: false,
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

async function deleteFolder(req, res) {
  try {
    const folderId = req.params.folderId;
    const folder = await folderQuery.getFolderContents(folderId);
    const itemCount = folder.contents.length;

    return res.render("layout", {
      title: "Confirm Folder Deletion",
      navbar: false,
      sidebar: true,
      body: "pages/deleteFolder",
      folderId,
      folderName: folder.folderName,
      folder,
      itemCount,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}

async function deleteFolderHandler(req, res) {
  try {
    const folderId = req.params.folderId;

    // Ensure the folder exists before deletion
    const folder = await folderQuery.getFolderContents(folderId);
    if (!folder) {
      return res.status(404).send("Folder not found.");
    }

    // Delete folder and all its contents
    await folderQuery.deleteFolder(folderId);

    return res.redirect("/dashboard"); // Redirect back to dashboard after deletion
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).send("Failed to delete folder.");
  }
}

module.exports = {
  getFolder,
  createFolder,
  getNewFolder,
  deleteFolder,
  deleteFolderHandler,
};
