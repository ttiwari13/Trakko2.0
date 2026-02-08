-- CreateTable
CREATE TABLE "PathInvite" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PathInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PathInvite_token_key" ON "PathInvite"("token");

-- CreateIndex
CREATE INDEX "PathInvite_pathId_idx" ON "PathInvite"("pathId");

-- AddForeignKey
ALTER TABLE "PathInvite" ADD CONSTRAINT "PathInvite_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
