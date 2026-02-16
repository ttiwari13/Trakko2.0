-- AlterTable
ALTER TABLE "PathRoute" ADD COLUMN     "isFavourite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "PathRoute_isFavourite_idx" ON "PathRoute"("isFavourite");
