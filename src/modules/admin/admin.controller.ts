import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import { success } from "better-auth/*";


const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminService.getUsers(req.query);
        return res.status(200).json({
            success: true,
            message: "Retrieved users.",
            data: {
                meta: result.meta,
                users: result.data
            }
        })
    }
    catch (e) {
        next(e);
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        if (!userId) return res.status(400).json({
            success: false,
            message: "user id not found"
        });

        const data = req.body;

        if (!data.status) return res.status(400).json({
            success: false,
            message: "status not found"
        });

        const result = await adminService.updateUser({ ...data, userId });

        res.status(200).json({
            success: true,
            message: data.status === 'banned' ? 'User has been banned' : "User has been unbanned",
            user: result
        })

    }
    catch (e) {
        next(e);
    }
}

export const adminController = {
    getUsers,
    updateUser,
}