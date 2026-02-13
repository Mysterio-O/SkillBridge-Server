import { NextFunction, Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { UserRole } from "../../middleware/auth";

const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "unauthorized" });
        }

        const id = user.id;
        const role = user.role as UserRole;

        const data = await dashboardService.getDashboardStats(id, role);

        return res.status(200).json({
            success: true,
            message: "dashboard stats",
            data,
        });
    } catch (e) {
        next(e);
    }
};

export const dashboardController = { getDashboardStats };
