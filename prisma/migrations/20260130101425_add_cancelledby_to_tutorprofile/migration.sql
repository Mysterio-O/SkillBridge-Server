-- AlterEnum
ALTER TYPE "TutorProfileStatus" ADD VALUE 'cancelled';

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledById" TEXT;

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
