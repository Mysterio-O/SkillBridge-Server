import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "../../lib/auth";

const getCurrentUser = async (id: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id },
    });
    return user;
};

const register = async (payload: { name: string; email: string; password: string; role?: string }) => {
    const { name, email, password, role } = payload;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User already exists");

    const userId = randomUUID();

    const user = await prisma.user.create({
        data: {
            id: userId,
            name,
            email,
            role: role || "student",
            emailVerified: false,
        },
    });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.account.create({
        data: {
            id: randomUUID(),
            accountId: userId,
            providerId: "email",
            userId: userId,
            password: hashed,
        },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.verification.create({
        data: {
            id: randomUUID(),
            identifier: email,
            value: token,
            expiresAt,
        },
    });

    // send verification email (best effort)
    sendVerificationEmail(user, token).catch((e) => console.error(e));

    return user;
};

const login = async (payload: { email: string; password: string }) => {
    const { email, password } = payload;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const account = await prisma.account.findFirst({ where: { userId: user.id, providerId: "email" } });
    if (!account || !account.password) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, account.password);
    if (!ok) throw new Error("Invalid credentials");

    // Prefer explicit JWT_SECRET; fallback to BETTER_AUTH_SECRET for compatibility
    const secret = (process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET) as string | undefined;
    if (!secret) throw new Error("JWT secret not configured");

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
        data: {
            id: randomUUID(),
            expiresAt,
            token,
            userId: user.id,
        },
    });

    return { token, user };
};

const verifyEmail = async (token: string) => {
    const record = await prisma.verification.findFirst({ where: { value: token } });
    if (!record) throw new Error("Invalid token");
    if (new Date(record.expiresAt) < new Date()) throw new Error("Token expired");

    // mark user verified
    await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: true } });

    // remove verification
    await prisma.verification.deleteMany({ where: { identifier: record.identifier } });

    return true;
};

export const authService = {
    getCurrentUser,
    register,
    login,
    verifyEmail,
};