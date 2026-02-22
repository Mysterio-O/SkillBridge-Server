import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
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
        try {
            const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
            console.log(`[AUTH] ${req.method} ${req.path} - Authorization header: ${authHeader ? 'present' : 'MISSING'}`);
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.log('[AUTH] No Bearer token in header');
                return res.status(401).json({ success: false, message: 'unauthorized access' });
            }

            const token = authHeader.split(' ')[1];
            console.log(`[AUTH] Token length: ${token.length}`);

            // First, verify the JWT signature itself
            const secret = (process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET) as string | undefined;
            if (!secret) {
                console.error('[AUTH] JWT secret not configured');
                return res.status(401).json({ success: false, message: 'unauthorized' });
            }

            let decoded: any;
            try {
                decoded = jwt.verify(token, secret) as { userId: string };
                console.log(`[AUTH] JWT verified. UserId: ${decoded.userId}`);
            } catch (err) {
                const errMsg = err instanceof jwt.TokenExpiredError ? 'token expired' : 'invalid token';
                console.log(`[AUTH] JWT verification failed: ${errMsg}`);
                return res.status(401).json({ success: false, message: 'invalid or expired token' });
            }

            if (!decoded.userId) {
                console.log('[AUTH] Invalid token payload - missing userId');
                return res.status(401).json({ success: false, message: 'invalid token payload' });
            }

            // Then verify token exists as a session (for session tracking/revocation)
            const session = await prisma.session.findUnique({
                where: { token },
                include: { user: true },
            });

            if (!session) {
                console.log(`[AUTH] Session not found in DB for token`);
                return res.status(401).json({ success: false, message: 'invalid session' });
            }

            console.log(`[AUTH] Session found. User: ${session.user?.email}`);

            if (new Date(session.expiresAt) < new Date()) {
                console.log('[AUTH] Session expired');
                return res.status(401).json({ success: false, message: 'session expired' });
            }

            const user = session.user;

            if (!user) {
                console.log('[AUTH] No user in session');
                return res.status(401).json({ success: false, message: 'unauthorized access' });
            }

            // Comment out email verification check for development
            // if (!user.emailVerified) return res.status(403).json({ success: false, message: 'email verification required' });

            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: (user.role as string) || 'student',
                emailVerified: user.emailVerified,
            };

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                console.log(`[AUTH] Forbidden - user role '${req.user.role}' not in allowed roles`);
                return res.status(403).json({ success: false, message: 'forbidden access' });
            }

            console.log(`[AUTH] ✓ Authenticated as ${user.email} (${user.role})`);
            next();
        } catch (err) {
            console.error('[AUTH] Unexpected error:', err);
            return res.status(401).json({ success: false, message: 'unauthorized' });
        }
    }
}

export default auth