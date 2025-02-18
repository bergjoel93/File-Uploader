// validators/newFileValidator.js
const { body } = require("express-validator");
const fileQuery = require("../db/queries/file");

const validateFileName = [
  body("fileName")
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_().]+$/) // Allow letters, numbers, spaces, dashes, underscores, parentheses, and periods
    .withMessage(
      "Invalid file name. Only letters, numbers, spaces, dashes, and underscores are allowed."
    )
    .customSanitizer((value) => value.replace(/\s+/g, " ")) // Replace multiple spaces with a single space
    .customSanitizer((value) => value.replace(/[<>:"/\\|?*]/g, "")) // Remove illegal file system characters
    .custom(async (fileName, { req }) => {
      const folderId = req.body.folderId;

      // Check if a file with the same name exists in the folder
      let newFileName = fileName;
      let count = 0;

      while (await fileQuery.fileNameExists(newFileName, folderId)) {
        count++;
        const fileExtension = newFileName.includes(".")
          ? newFileName.substring(newFileName.lastIndexOf("."))
          : "";
        const fileBaseName = fileExtension
          ? newFileName.substring(0, newFileName.lastIndexOf("."))
          : newFileName;
        newFileName = `${fileBaseName} (${count})${fileExtension}`;
      }

      return newFileName; // Return the sanitized and renamed file name
    }),
];
module.exports = { validateFileName };
