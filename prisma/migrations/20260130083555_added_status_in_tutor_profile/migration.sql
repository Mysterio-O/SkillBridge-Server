-- CreateEnum
CREATE TYPE "TutorProfileStatus" AS ENUM ('pending', 'active');

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "status" "TutorProfileStatus" NOT NULL DEFAULT 'pending';
