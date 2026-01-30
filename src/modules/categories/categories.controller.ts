import { NextFunction, Request, Response } from "express"
import { categoriesService } from "./categories.service";


const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({
            success: false,
            message: "body is missing"
        });

        const result = await categoriesService.createCategory(data);

        res.status(201).json({
            success: true,
            message: "category created successfully",
            category: result
        });

    }
    catch (e) {
        next(e);
    }
};

const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoriesService.getCategories();
        res.status(200).json({
            success: true,
            message: "Retrieved all categories",
            categories: result
        })
    }
    catch (e) {
        next(e);
    }
}

export const categoriesController = {
    createCategory,
    getCategories,
}