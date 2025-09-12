-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('WAITING', 'PLAYING', 'LEFT', 'FINISHED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profilePhoto" TEXT,
ALTER COLUMN "resetToken" DROP NOT NULL,
ALTER COLUMN "resetTokenExpiry" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxPlayer" INTEGER NOT NULL,
    "minPlayer" INTEGER NOT NULL,
    "thumbnail" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerGameProfile" (
    "id" SERIAL NOT NULL,
    "gameID" INTEGER NOT NULL,
    "playerID" INTEGER NOT NULL,
    "highScore" INTEGER NOT NULL DEFAULT 0,
    "totalPlayedTime" INTEGER NOT NULL DEFAULT 0,
    "gameCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerGameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSession" (
    "id" SERIAL NOT NULL,
    "gameID" INTEGER NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'WAITING',
    "winner" TEXT,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSessionPlayer" (
    "id" SERIAL NOT NULL,
    "sessionID" INTEGER NOT NULL,
    "playerID" INTEGER NOT NULL,

    CONSTRAINT "GameSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameProfile_gameID_playerID_key" ON "public"."PlayerGameProfile"("gameID", "playerID");

-- AddForeignKey
ALTER TABLE "public"."PlayerGameProfile" ADD CONSTRAINT "PlayerGameProfile_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerGameProfile" ADD CONSTRAINT "PlayerGameProfile_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSession" ADD CONSTRAINT "GameSession_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionPlayer" ADD CONSTRAINT "GameSessionPlayer_sessionID_fkey" FOREIGN KEY ("sessionID") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionPlayer" ADD CONSTRAINT "GameSessionPlayer_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
