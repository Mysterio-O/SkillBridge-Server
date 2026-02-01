/*
  Warnings:

  - The values [booked] on the enum `TutorAvailability` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TutorAvailability_new" AS ENUM ('available', 'not_available');
ALTER TABLE "public"."TutorProfile" ALTER COLUMN "availability" DROP DEFAULT;
ALTER TABLE "TutorProfile" ALTER COLUMN "availability" TYPE "TutorAvailability_new" USING ("availability"::text::"TutorAvailability_new");
ALTER TYPE "TutorAvailability" RENAME TO "TutorAvailability_old";
ALTER TYPE "TutorAvailability_new" RENAME TO "TutorAvailability";
DROP TYPE "public"."TutorAvailability_old";
ALTER TABLE "TutorProfile" ALTER COLUMN "availability" SET DEFAULT 'available';
COMMIT;
