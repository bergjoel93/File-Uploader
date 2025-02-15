// db/queries/file.js
const prisma = require("../prisma");

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
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("File not found");
      }

      return file;
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error; // Rethrow the error for handling in controllers
    }
  }
}

module.exports = new FileQuery();
