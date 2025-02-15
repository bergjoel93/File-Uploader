// controllers/fileController.js
const fs = require("fs");
const fileQuery = require("../db/queries/file");
const { UPLOADS_DIR } = require("../config/storageConfig");
const path = require("path");

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
    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}

async function moveFile() {}

async function renameFile() {}

async function downloadFile() {}

module.exports = { deleteFile, moveFile, renameFile, downloadFile };
