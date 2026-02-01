-- CreateEnum
CREATE TYPE "TutorAvailability" AS ENUM ('available', 'booked');

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "availability" "TutorAvailability" NOT NULL DEFAULT 'available';
