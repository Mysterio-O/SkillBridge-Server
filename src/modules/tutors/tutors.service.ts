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


const updateTutorApplication = async (
    applicationId: string,
    status: TutorProfileStatus,
    adminId: string
) => {
    const application = await prisma.tutorProfile.findUniqueOrThrow({
        where: { id: applicationId },
        select: { id: true, userId: true, status: true },
    });

    // Prisma-safe typed update object
    const data: Prisma.TutorProfileUpdateInput = { status: status };

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


export const tutorService = {
    addTutor,
    updateTutorApplication,
    getTutors,
    getTutorById,
}