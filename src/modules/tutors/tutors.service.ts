import { Prisma, TutorAvailability, TutorProfile, TutorProfileStatus, } from "../../../generated/prisma/client";
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
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search as string | undefined;

    const andConditions: TutorProfileWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                {
                    headline: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    about: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    subjects: {
                        some: {
                            category: {
                                name: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                },
                {
                    user: {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { bio: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    },
                },
            ],
        });
    }

    const whereCondition: Prisma.TutorProfileWhereInput = {
        AND: andConditions,
    };

    const { tutors, total } = await prisma.$transaction(async (tx) => {
        const tutors = await tx.tutorProfile.findMany({
            take: limit,
            skip,
            where: whereCondition,
            include: {
                subjects: {
                    include: {
                        category: true,
                    },
                },
                user: true,
            },
        });

        const total = await tx.tutorProfile.count({
            where: whereCondition,
        });

        return { tutors, total };
    });

    const totalPages = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
        data: tutors,
    };
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

const updateAvailability = async (status: TutorAvailability, userId: string) => {
    const result = await prisma.tutorProfile.update({
        where: {
            userId: userId
        },
        data: {
            availability: status
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
    updateAvailability,
}