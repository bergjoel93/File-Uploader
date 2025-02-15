// controllers/uploadController.js
const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");
const path = require("path");

const { UPLOADS_DIR } = require("../config/storageConfig");

///// Get
async function getUpload(req, res) {
  try {
    const folderId = req.params.folderId;
    const folderContents = await folderQuery.getFolderContents(folderId);
    return res.render("layout", {
      title: "Upload a file",
      navbar: true,
      sidebar: true,
      body: "pages/upload",
      folderId,
      folderName: folderContents.folderName,
    });
  } catch (error) {
    console.error("Error fetching folder:", error);
    return res.status(404).send("Folder not found.");
  }
}

async function postUpload(req, res) {
  const folderId = req.params.folderId;
  const folderContents = await folderQuery.getFolderContents(folderId);

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Extrac names from uploaded file
    const name = req.file.originalname; // User-facing name
    const fileName = req.file.filename; // unique stored filename

    // Construct the file path dynamically using the centralized UPLOADS_DIR
    const filePath = path.join(UPLOADS_DIR, fileName);
    // Save file metadata to the database using fileQueries
    const newFile = await fileQuery.createFile(
      name,
      fileName,
      filePath,
      folderId
    );
    console.log("File uploaded:", newFile);

    if (folderContents.isRoot) {
      return res.redirect("/dashboard");
    } else {
      return res.redirect(`/dashboard/folder/${folderId}`);
    }
  } catch (error) {
    console.error("Error saving file:", error);
    return res.status(500).send("Error saving file to database.");
  }
}

module.exports = { getUpload, postUpload };
