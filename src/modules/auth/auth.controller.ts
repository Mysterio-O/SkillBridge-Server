import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";


const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log('started');
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({
            success: false,
            message: "unauthorized access"
        });

        const result = await authService.getCurrentUser(user.id);

        res.status(200).json({
            success: true,
            user: result
        })

    } catch (e) {
        next(e);
    }
};


export const authController = {
    getCurrentUser,
}