/*
  Warnings:

  - You are about to drop the column `tutorId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `tutorProfileId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tutorId_fkey";

-- DropIndex
DROP INDEX "bookings_tutorId_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "tutorId",
ADD COLUMN     "tutorProfileId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_tutorProfileId_idx" ON "bookings"("tutorProfileId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
