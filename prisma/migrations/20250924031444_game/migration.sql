/*
  Warnings:

  - A unique constraint covering the columns `[sessionID,playerID]` on the table `GameSessionPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."GameSession" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "GameUrl" TEXT,
ADD COLUMN     "ProcessID" INTEGER,
ADD COLUMN     "StartedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionPlayer_sessionID_playerID_key" ON "public"."GameSessionPlayer"("sessionID", "playerID");
