const folderQuery = require("../db/queries/folder");
const fileQuery = require("../db/queries/file");
const multer = require("multer");
const path = require("path");
// Configure where to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // unique filename
  },
});

const upload = multer({ storage });

///// Get
async function getUpload(req, res) {
  const folderId = req.params.folderId;
  console.log("Folder ID", folderId);

  try {
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
    // Save file metadata to the database using fileQueries
    const newFile = await fileQuery.createFile(
      req.file.filename,
      `uploads/${req.file.filename}`,
      folderId
    );

    console.log("File uploaded:", req.file);
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

module.exports = { getUpload, postUpload, upload };
