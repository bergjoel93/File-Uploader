//config/storageConfig.js
const path = require("path");
const multer = require("multer");

// Define the base directory for uploads
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Store files in memory, NOT on disk immediately
const storage = multer.memoryStorage();

// Multer middleware
const upload = multer({ storage });

module.exports = {
  UPLOADS_DIR,
  upload,
};
