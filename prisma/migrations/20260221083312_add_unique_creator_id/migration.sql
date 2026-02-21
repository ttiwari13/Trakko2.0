/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `Path` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Path_creatorId_key" ON "Path"("creatorId");
