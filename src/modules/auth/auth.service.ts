import { prisma } from "../../lib/prisma"


const getCurrentUser = async (id: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: id
        }
    });
    return user;
};


export const authService = {
    getCurrentUser,
}