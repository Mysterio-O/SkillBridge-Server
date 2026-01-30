import { Categories } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"


const createCategory = async (payload: Omit<Categories, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await prisma.categories.create({
        data: {
            ...payload
        }
    });
    return result;
};

const getCategories = async()=> {
    return await prisma.categories.findMany();
}

export const categoriesService = {
    createCategory,
    getCategories,
}