const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log("🌱 Seeding test data for user 'bergjoel' (ID: 1)...");

    const userId = 1; // Reference existing user

    // 1️⃣ Fetch the root folder (DO NOT create a new one)
    const rootFolder = await prisma.folder.findFirst({
      where: { userId, isRoot: true },
    });

    if (!rootFolder) {
      throw new Error("❌ Root folder not found for user bergjoel (ID: 1).");
    }
    console.log(`✅ Found Root Folder: ${rootFolder.id}`);

    // 2️⃣ Fetch existing subfolders correctly
    const existingFolders = await prisma.folder.findMany({
      where: { userId, parentId: rootFolder.id }, // Ensure these are subfolders
      select: { name: true },
    });

    const folderNames = existingFolders.map((f) => f.name);

    // Define subfolders to create (ensure isRoot: false)
    const subfoldersToCreate = [
      { name: "Projects", isRoot: false, userId, parentId: rootFolder.id },
      { name: "Documents", isRoot: false, userId, parentId: rootFolder.id },
      { name: "Photos", isRoot: false, userId, parentId: rootFolder.id },
    ].filter((folder) => !folderNames.includes(folder.name)); // Only create missing ones

    console.log("📝 Subfolders to create:", subfoldersToCreate); // Debugging output

    // ✅ Ensure at least one subfolder exists before running create()
    if (subfoldersToCreate.length > 0) {
      for (const folder of subfoldersToCreate) {
        console.log(
          `📁 Creating folder: ${folder.name}, isRoot: ${folder.isRoot}`
        );
        await prisma.folder.create({ data: folder });
      }
      console.log(
        `✅ Created Subfolders: ${subfoldersToCreate
          .map((f) => f.name)
          .join(", ")}`
      );
    } else {
      console.log(`✅ All subfolders already exist.`);
    }

    console.log("🎉 Seeding Complete!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDatabase();
