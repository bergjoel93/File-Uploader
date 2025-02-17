// db/queries/file.js
const prisma = require("../prisma");
const fs = require("fs").promises; // Use promises-based fs module
const path = require("path");
const mime = require("mime-types");
const { UPLOADS_DIR } = require("../../config/storageConfig");

class FileQuery {
  /**
   * Save a new file to the database.
   * @param {string} name - The filename.
   * @param {string} path - The file's storage path.
   * @param {number} folderId - The folder the file belongs to.
   * @returns {Promise<object>} - The created file record.
   */
  async createFile(name, fileName, url, folderId) {
    try {
      return await prisma.file.create({
        data: {
          name,
          fileName,
          url,
          folderId,
        },
      });
    } catch (error) {
      console.error("Error saving file:", error);
      throw new Error("Failed to save file to the database.");
    }
  }

  /**
   * Get all files inside a folder.
   * @param {number} folderId - The folder ID.
   * @returns {Promise<Array>} - List of files.
   */
  async getFilesInFolder(folderId) {
    try {
      return await prisma.file.findMany({
        where: { folderId },
        select: {
          id: true,
          name: true,
          url: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      throw new Error("Failed to retrieve files.");
    }
  }

  /**
   * Delete a file by ID.
   * @param {number} fileId - The file ID.
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      await prisma.file.delete({ where: { id: fileId } });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file.");
    }
  }

  async getFileById(fileId) {
    try {
      // 1️⃣ Fetch file from the database
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: {
          id: true,
          name: true,
          fileName: true,
          url: true,
          folderId: true,
          createdAt: true,
        },
      });

      if (!file) {
        throw new Error("File not found");
      }

      // 2️⃣ Get file size and MIME type from the file system
      const filePath = path.join(UPLOADS_DIR, file.fileName);

      let fileSize = null;
      let mimeType = null;

      try {
        const stats = await fs.stat(filePath);
        fileSize = stats.size; // Size in bytes
        mimeType = mime.lookup(filePath) || "Unknown"; // Guess MIME type
      } catch (fsError) {
        console.error("Error retrieving file metadata:", fsError);
        fileSize = "Unknown";
        mimeType = "Unknown";
      }

      // 3️⃣ Generate breadcrumbs
      const breadcrumbs = await this.buildFileBreadcrumbs(file.id);

      // 4️⃣ Return full file object with metadata
      return { ...file, fileSize, mimeType, breadcrumbs };
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error; // Rethrow for handling in controllers
    }
  }

  /**
   * Recursively builds breadcrumbs for a file by tracing its parent folders.
   */
  async buildFileBreadcrumbs(fileId) {
    let breadcrumbs = [];

    console.log("fileId:", fileId);

    // 1️⃣ Fetch the file with its folderId
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, name: true, folderId: true },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // 2️⃣ Start with the file's folder
    let folder = await prisma.folder.findUnique({
      where: { id: file.folderId },
      select: { id: true, name: true, parentId: true },
    });

    // 3️⃣ Traverse up the folder hierarchy
    while (folder) {
      breadcrumbs.unshift({ name: folder.name, folderId: folder.id });

      if (!folder.parentId) break; // Stop at the root

      // Move up the hierarchy
      folder = await prisma.folder.findUnique({
        where: { id: folder.parentId },
        select: { id: true, name: true, parentId: true },
      });
    }

    // 4️⃣ Add the file itself at the end
    breadcrumbs.push({ name: file.name, fileId: file.id });

    return breadcrumbs;
  }
}

module.exports = new FileQuery();
