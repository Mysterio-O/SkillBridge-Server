import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { Prisma } from "../../../generated/prisma/client";


type GetUsersFilter = {
    search?: string;
    page?: number;
    limit?: number;
};

type UpdateUser = {
    userId: string;
    status: string;
    banReason?: string;
}

const getUsers = async (filters: GetUsersFilter) => {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;
    const search = filters.search?.trim();

    const andConditions: UserWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { bio: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    const whereCondition: Prisma.UserWhereInput = {
        AND: andConditions,
    };

    const { users, total } = await prisma.$transaction(async (tx) => {
        const users = await tx.user.findMany({
            where: whereCondition,
            take: limit,
            skip,
            orderBy: {
                createdAt: "desc",
            },
        });

        const total = await tx.user.count({
            where: whereCondition,
        });

        return { users, total };
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
        data: users,
    };
};

const updateUser = async (payload: UpdateUser) => {
    const result = await prisma.user.update({
        where: {
            id: payload.userId
        },
        data: {
            status: payload.status,
            banReason: payload.banReason || null,
            bannedAt: payload.status === 'banned' ? new Date(Date.now()) : null
        }
    });
    return result;
}


export const adminService = {
    getUsers,
    updateUser,
}