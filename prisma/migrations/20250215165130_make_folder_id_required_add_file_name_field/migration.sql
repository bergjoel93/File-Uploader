/*
  Warnings:

  - Added the required column `fileName` to the `File` table without a default value. This is not possible if the table is not empty.
  - Made the column `folderId` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "fileName" TEXT NOT NULL,
ALTER COLUMN "folderId" SET NOT NULL;
