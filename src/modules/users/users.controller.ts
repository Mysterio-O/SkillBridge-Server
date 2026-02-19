import { NextFunction, Request, Response } from "express";
import { userService } from "./users.service";


const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = req.user;
        const userId = authUser?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        const updated = await userService.updateProfile(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updated,
        });
    } catch (e) {
        next(e);
    }
};



export const userController = {
    updateProfile,
}