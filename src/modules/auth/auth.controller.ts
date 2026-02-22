import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";


const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('started');
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({
            success: false,
            message: "unauthorized access"
        });

        const result = await authService.getCurrentUser(user.id);

        console.log(result);

        res.status(200).json({
            success: true,
            user: result
        })

    } catch (e) {
        next(e);
    }
};


const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });

        const user = await authService.register({ name, email, password, role });

        res.status(201).json({ success: true, message: 'user registered', user });
    } catch (e: any) {
        next(e);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });

        const result = await authService.login({ email, password });

        res.status(200).json({ success: true, message: 'logged in', data: result });
    } catch (e) {
        next(e);
    }
};

const verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query as any;
        if (!token) return res.status(400).json({ success: false, message: 'token missing' });

        await authService.verifyEmail(token as string);
        res.status(200).json({ success: true, message: 'email verified' });
    } catch (e) {
        next(e);
    }
};

export const authController = {
    getCurrentUser,
    register,
    login,
    verify,
}