// controllers/uploadController.js

const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");
const path = require("path");
const fs = require("fs").promises; // Use promises for better async handling
const { UPLOADS_DIR } = require("../config/storageConfig");

///// Get
async function getUpload(req, res) {
  try {
    const folderId = req.params.folderId;
    const folderContents = await folderQuery.getFolderContents(folderId);
    return res.render("layout", {
      title: "Upload a file",
      navbar: true,
      sidebar: false,
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
    // Get original file name
    const originalFileName = req.file.originalname;
    // Sanitize and validate file name.
    const newFileName = await sanitizeFileName(originalFileName, folderId);
    // Generate a stored file name (unique timestamped version)
    console.log("New file name", newFileName);

    // Generate storedName
    const storedName = Date.now() + "-" + originalFileName;

    // Construct the file url dynamically using the centralized UPLOADS_DIR
    const url = path.join(UPLOADS_DIR, storedName);

    // get filetype
    const fileType = req.file.mimetype;
    //  Write the file to disk (since Multer is using memory storage)
    await fs.writeFile(url, req.file.buffer);

    // Save file metadata to the database using fileQueries
    const newFile = await fileQuery.createFile(
      newFileName,
      storedName,
      url,
      folderId,
      fileType
    );
    console.log("File uploaded:", newFile);

    // Redirect user after successful upload
    return res.redirect(
      folderContents.isRoot ? "/dashboard" : `/dashboard/folder/${folderId}`
    );
  } catch (error) {
    console.error("Error saving file:", error);
    return res.status(500).send("Error saving file to database.");
  }
}

// Helper Function to sanitize file names so they don't collide.
async function sanitizeFileName(fileName, folderId) {
  // ✅ Remove illegal characters
  let originalFileName = fileName.replace(/[<>:"/\\|?*]/g, "").trim();

  // ✅ Ensure filename contains only allowed characters
  if (!/^[a-zA-Z0-9\s\-_().]+$/.test(originalFileName)) {
    throw new Error(
      "Invalid file name. Only letters, numbers, spaces, dashes, and underscores are allowed."
    );
  }

  let newFileName = originalFileName;
  let count = 0;

  // ✅ Prevent infinite loops
  while (await fileQuery.fileNameExists(newFileName, folderId)) {
    count++;
    if (count > 100)
      throw new Error("Too many duplicate filenames in this folder.");

    // ✅ Extract base name & extension correctly
    const fileExtension = path.extname(originalFileName); // e.g., ".jpg"
    const fileBaseName = path.basename(originalFileName, fileExtension); // e.g., "image"

    newFileName = `${fileBaseName} (${count})${fileExtension}`;
  }

  return newFileName;
}

module.exports = { getUpload, postUpload };
