-- CreateTable
CREATE TABLE "PathRoute" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "encodedPolyline" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "activityType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PathRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathRouteNote" (
    "id" TEXT NOT NULL,
    "pathRouteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pointIndex" INTEGER NOT NULL,
    "noteText" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PathRouteNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PathRoute_pathId_idx" ON "PathRoute"("pathId");

-- CreateIndex
CREATE INDEX "PathRoute_creatorId_idx" ON "PathRoute"("creatorId");

-- CreateIndex
CREATE INDEX "PathRouteNote_pathRouteId_idx" ON "PathRouteNote"("pathRouteId");

-- CreateIndex
CREATE INDEX "PathRouteNote_userId_idx" ON "PathRouteNote"("userId");

-- AddForeignKey
ALTER TABLE "PathRoute" ADD CONSTRAINT "PathRoute_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathRoute" ADD CONSTRAINT "PathRoute_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathRouteNote" ADD CONSTRAINT "PathRouteNote_pathRouteId_fkey" FOREIGN KEY ("pathRouteId") REFERENCES "PathRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathRouteNote" ADD CONSTRAINT "PathRouteNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
