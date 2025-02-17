// routes/router.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAuth, isAdmin } = require("../authentication/authMiddleware");
// Controllers
const { getIndex, getLogout } = require("../controllers/indexController");
const {
  getRegister,
  postRegister,
} = require("../controllers/registerController");
const { getDashboard } = require("../controllers/dashboardController");
const { postLogin } = require("../controllers/loginController");
const { getUpload, postUpload } = require("../controllers/uploadController");
const {
  getFolder,
  createFolder,
  getNewFolder,
  deleteFolder,
  deleteFolderHandler,
} = require("../controllers/folderController");

const { upload } = require("../config/storageConfig");
const { validateRegistration } = require("../validators/registrationValidator");
const { validateLogin } = require("../validators/loginValidation");

const {
  getFile,
  deleteFile,
  moveFile,
  renameFile,
  downloadFile,
} = require("../controllers/fileController");

////////// GET ROUTES //////////////

router.get("/", getIndex);
router.get("/register", getRegister);
router.get("/login", getIndex);
router.get("/dashboard", isAuth, getDashboard);
router.get("/logout", getLogout);
router.get("/upload/:folderId", isAuth, getUpload);

////////// GET ROUTES FOR FILES/FOLDERS ////////////
router.get("/dashboard/folder/:folderId", isAuth, getFolder);
router.get("/newFolder/:parentFolderId", isAuth, getNewFolder);
//router.get("/dashboard/file/:fileId")
router.get("/folder/delete/:folderId", isAuth, deleteFolder);
router.get("/file/:fileId", isAuth, getFile);
router.get("/file/download/:fileId", isAuth, downloadFile);

// POST ROUTES FOR FILES/FOLDERS
router.post(
  "/upload/:folderId",
  isAuth,
  upload.single("uploadedFile"),
  postUpload
);
router.post("/file/delete/:fileId", isAuth, deleteFile);
router.post("/newFolder/:parentFolderId", isAuth, createFolder);
router.post("/folder/delete/:folderId", isAuth, deleteFolderHandler);

////////// POST ROUTES //////////////
router.post("/register", validateRegistration, postRegister);
router.post("/login", validateLogin, postLogin);

module.exports = router;
