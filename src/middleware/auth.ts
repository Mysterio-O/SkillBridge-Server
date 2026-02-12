import { auth as betterAuth } from '../lib/auth';
import { NextFunction, Request, Response } from 'express';
export enum UserRole {
    STUDENT = 'student',
    TUTOR = 'tutor',
    ADMIN = 'admin'
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean
            }
        }
    }
}

const auth = (...roles: UserRole[]) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        const session = await betterAuth.api.getSession({
            headers: req.headers as any
        });
        // console.log(roles)
        // console.log(session);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: "unauthorized access"
            })
        };

        if (!session.user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "email verification required"
            })
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as string,
            emailVerified: session.user.emailVerified
        }
        console.log(req.user)

        if (roles.length && !roles.includes(req.user.role as UserRole)) {
            return res.status(403).json({
                success: false,
                message: "forbidden access"
            })
        }

        console.log('middleware',req.user)

        next()
    }
}

export default auth