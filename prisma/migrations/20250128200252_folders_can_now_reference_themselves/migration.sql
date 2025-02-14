/*
  Warnings:

  - A unique constraint covering the columns `[userId,isRoot]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "isRoot" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_userId_isRoot_key" ON "Folder"("userId", "isRoot");
