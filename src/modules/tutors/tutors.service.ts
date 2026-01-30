import { CancelledBy, Prisma, TutorProfile, TutorProfileStatus, } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const addTutor = async (payload: Omit<TutorProfile, 'id' | 'createdAt' | 'updatedAt'>, id: string) => {
    const result = await prisma.tutorProfile.create({
        data: {
            ...payload,
            userId: id
        }
    });
    return result;
};


export const updateTutorApplication = async (
  applicationId: string,
  status: TutorProfileStatus,
  adminId: string
) => {
  const application = await prisma.tutorProfile.findUniqueOrThrow({
    where: { id: applicationId },
    select: { id: true, userId: true, status: true },
  });

  // Prisma-safe typed update object
  const data: Prisma.TutorProfileUpdateInput = { status:status };

  // only set canceller when cancelled
  if (status === "cancelled") {
    data.cancelledBy = { connect: { id: adminId } }; 
  } else {
    data.cancelledBy = { disconnect: true };
  }

  const result = await prisma.tutorProfile.update({
    where: { id: application.id },
    data,
  });

  return result;
};


export const tutorService = {
    addTutor,
    updateTutorApplication,
}