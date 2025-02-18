// controllers/fileController.js
const fs = require("fs");
const fileQuery = require("../db/queries/file");
const { UPLOADS_DIR } = require("../config/storageConfig");
const path = require("path");

async function getFile(req, res) {
  try {
    const fileId = req.params.fileId;
    const file = await fileQuery.getFileById(fileId);
    console.log("File breadcrumbs:", file.breadcrumbs);

    return res.render("layout", {
      title: file.name,
      navbar: true,
      sidebar: false,
      body: "pages/file",
      file,
      breadcrumbs: file.breadcrumbs,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}

async function deleteFile(req, res) {
  try {
    const fileId = req.params.fileId;
    const file = await fileQuery.getFileById(fileId);
    // Delete file in database
    await fileQuery.deleteFile(fileId);
    console.log(`${file.name} has been deleted from the database.`);
    // Delete file from directory or storage
    const filePath = path.join(UPLOADS_DIR, file.fileName);
    // Delete file from file system
    await fs.promises.unlink(filePath);
    console.log(`${file.name} has been deleted from storage.`);
    // Redirect user after successful upload
    return res.redirect(
      folderContents.isRoot
        ? "/dashboard"
        : `/dashboard/folder/${file.folderId}`
    );
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}

async function downloadFile(req, res) {
  try {
    const fileId = req.params.fileId;

    // 1️⃣ Get file details
    const file = await fileQuery.getFileById(fileId);
    if (!file) {
      return res.status(404).send("File not found.");
    }

    // 2️⃣ Construct full file path
    const filePath = path.join(UPLOADS_DIR, file.fileName);

    // 3️⃣ Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server.");
    }

    // 4️⃣ Set correct headers and send file
    res.download(filePath, file.name, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error.");
  }
}

async function moveFile() {}

async function renameFile() {}

module.exports = { getFile, deleteFile, moveFile, renameFile, downloadFile };
