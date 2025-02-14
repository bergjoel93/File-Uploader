const prisma = require("../prisma");

class FolderQueries {
  // Create a root folder for a new user
  async createRootFolder(userId) {
    return await prisma.folder.create({
      data: {
        name: "root", // Default root folder name
        isRoot: true,
        userId: userId,
        parentId: null, // Root folder has no parent
      },
    });
  }

  // Get the root folder of a user
  async getRootContents(userId) {
    try {
      // 1️⃣ Find the root folder of the user
      const rootFolder = await prisma.folder.findFirst({
        where: { userId, isRoot: true },
        select: { id: true, name: true, userId: true, createdAt: true }, // Fetch only necessary fields
      });

      if (!rootFolder) {
        throw new Error("Root folder not found for user.");
      }

      // 2️⃣ Fetch subfolders and files inside the root folder
      const [subfolders, files] = await Promise.all([
        prisma.folder.findMany({
          where: { parentId: rootFolder.id }, // Find child folders
          select: {
            id: true,
            name: true,
            userId: true,
            parentId: true,
            createdAt: true,
          }, // Fetch required fields
        }),
        prisma.file.findMany({
          where: { folderId: rootFolder.id }, // Find files inside root
          select: {
            id: true,
            name: true,
            url: true,
            folderId: true,
            createdAt: true,
          }, // Fetch required fields
        }),
      ]);

      // 3️⃣ Format the response
      return {
        folderId: rootFolder.id,
        folderName: rootFolder.name,
        parentId: null, // Root has no parent
        userId: rootFolder.userId,
        createdAt: rootFolder.createdAt,
        type: "folder",
        contents: [
          ...subfolders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            userId: folder.userId,
            parentId: folder.parentId,
            type: "folder",
            createdAt: folder.createdAt,
          })),
          ...files.map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
            folderId: file.folderId,
            type: "file",
            createdAt: file.createdAt,
          })),
        ],
      };
    } catch (error) {
      console.error("Error fetching root folder contents:", error);
      throw error;
    }
  }

  async deleteFolder(folderId, userId) {
    try {
      // Check if the folder is root
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new Error("Folder not found.");
      }

      if (folder.isRoot) {
        throw new Error("You cannot delete the root folder.");
      }

      // Delete all subfolders & files
      await prisma.file.deleteMany({ where: { folderId } });
      await prisma.folder.deleteMany({ where: { parentId: folderId } });

      // Delete the folder itself
      await prisma.folder.delete({ where: { id: folderId } });

      return { message: "Folder deleted successfully" };
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw new Error("Could not delete folder.");
    }
  }

  /**
   * Fetch a folder's contents by folderId
   * Returns an object with folder details, subfolders, files, and breadcrumbs.
   */
  async getFolderContents(folderId) {
    try {
      // 1️⃣ Fetch the folder itself
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: {
          id: true,
          name: true,
          userId: true,
          parentId: true,
          createdAt: true,
          isRoot: true,
        },
      });

      if (!folder) {
        throw new Error("Folder not found.");
      }

      // 2️⃣ Generate breadcrumbs (trace parent hierarchy)
      const breadcrumbs = await this.buildBreadcrumbs(folder);

      // 3️⃣ Fetch subfolders inside this folder
      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId }, // Find child folders
        select: {
          id: true,
          name: true,
          userId: true,
          parentId: true,
          createdAt: true,
          isRoot: true,
        },
      });

      // 4️⃣ Fetch files inside this folder
      const files = await prisma.file.findMany({
        where: { folderId: folderId },
        select: {
          id: true,
          name: true,
          url: true,
          folderId: true,
          createdAt: true,
        },
      });

      // 5️⃣ Format the response
      return {
        folderId: folder.id,
        folderName: folder.name,
        userId: folder.userId,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        isRoot: folder.isRoot,
        type: "folder",
        breadcrumbs,
        contents: [
          ...subfolders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            userId: folder.userId,
            parentId: folder.parentId,
            createdAt: folder.createdAt,
            isRoot: folder.isRoot,
            type: "folder",
          })),
          ...files.map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
            folderId: file.folderId,
            createdAt: file.createdAt,
            type: "file",
          })),
        ],
      };
    } catch (error) {
      console.error("Error fetching folder contents:", error);
      throw error;
    }
  }

  /**
   * Recursively builds the breadcrumbs array by tracing parent folders.
   * Starts from the given folder and moves up to the root.
   */
  async buildBreadcrumbs(folder) {
    let breadcrumbs = [];

    while (folder) {
      breadcrumbs.unshift({ name: folder.name, folderId: folder.id });

      if (!folder.parentId) break; // Stop at the root

      // Move up the hierarchy
      folder = await prisma.folder.findUnique({
        where: { id: folder.parentId },
        select: { id: true, name: true, parentId: true },
      });
    }

    // Ensure the first breadcrumb is always "Root"
    if (!breadcrumbs.find((b) => b.folderId === null)) {
      breadcrumbs.unshift({ name: "Root", folderId: null });
    }

    return breadcrumbs;
  }
}

module.exports = new FolderQueries();
