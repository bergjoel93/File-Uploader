//config/storageConfig.js
const path = require("path");
const multer = require("multer");

// Define the base directory for uploads
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Multer middleware
const upload = multer({ storage });

module.exports = {
  UPLOADS_DIR,
  upload,
};
