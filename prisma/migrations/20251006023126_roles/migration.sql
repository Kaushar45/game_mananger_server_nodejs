-- CreateEnum
CREATE TYPE "public"."Roles" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Roles" NOT NULL DEFAULT 'USER';
