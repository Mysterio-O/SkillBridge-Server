import { prisma } from "../../lib/prisma";
import { validateAndBuildUpdate } from "./users.helper";


const updateProfile = async (userId: string, body: unknown) => {
    const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true, bannedAt: true },
    });

    if (!existing) {
        const err = new Error("User not found.");
        (err as any).statusCode = 404;
        throw err;
    }

    if (existing.bannedAt || existing.status === "banned") {
        const err = new Error("Your account is banned. You cannot update your profile.");
        (err as any).statusCode = 403;
        throw err;
    };

    const data = validateAndBuildUpdate(body);

    const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            phone: true,
            status: true,
            bio: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            bannedAt: true,
            banReason: true,
        },
    });

    return updated;

}

export const userService = {
    updateProfile,
}