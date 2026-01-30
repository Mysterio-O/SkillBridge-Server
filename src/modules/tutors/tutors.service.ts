import { TutorProfile } from "../../../generated/prisma/client";
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


export const tutorService = {
    addTutor
}