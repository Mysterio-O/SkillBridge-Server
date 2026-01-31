import { Prisma, TutorProfile, TutorProfileStatus, } from "../../../generated/prisma/client";
import { TutorProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


type Query = Record<string, unknown>;

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
  return prisma.$transaction(async (tx) => {
    const application = await tx.tutorProfile.findUniqueOrThrow({
      where: { id: applicationId },
      select: { id: true, userId: true, status: true },
    });

    if (application.status === status) {
      return tx.tutorProfile.findUniqueOrThrow({ where: { id: applicationId } });
    }

    const profileData: Prisma.TutorProfileUpdateInput = {
      status,
      cancelledBy:
        status === "cancelled"
          ? { connect: { id: adminId } }
          : { disconnect: true },
    };

    const updatedProfile = await tx.tutorProfile.update({
      where: { id: application.id },
      data: profileData,
    });

    
    if (status === "active") {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "tutor" },
      });
    }

    if (status === "cancelled") {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "student" },
      });
    }

    return updatedProfile;
  });
};

const getTutors = async (query: Query) => {
    const { limit, skip, search } = query;

    const andConditions: TutorProfileWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                {
                    headline: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    about: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    subjects: {
                        some: {
                            category: {
                                name: {
                                    contains: search as string,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    }
                },
                {
                    user: {
                        name: search,
                        bio: search,
                        email: search
                    }
                }
            ]
        })
    };

    const result = await prisma.tutorProfile.findMany({
        take: limit as number,
        skip: skip as number,
        where: {
            AND: andConditions
        },
        include: {
            subjects: {
                include: {
                    category: true
                }
            }
        }
    });

    console.log(result);

    return result.length > 0 ? result : []


};

const getTutorById = async (id: string) => {
    const tutor = await prisma.tutorProfile.findUniqueOrThrow({
        where: {
            id: id
        },
        include: {
            subjects: {
                include: {
                    category: true
                }
            }
        }
    })

    return tutor;
};

const updateTutorProfile = async (payload: Omit<TutorProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string) => {


    const result = await prisma.tutorProfile.update({
        where: {
            userId: userId
        },
        data: payload,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    return result;
}


export const tutorService = {
    addTutor,
    updateTutorApplication,
    getTutors,
    getTutorById,
    updateTutorProfile,
}