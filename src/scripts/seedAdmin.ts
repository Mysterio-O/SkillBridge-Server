import { config } from "../config/config";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {
        console.log("admin seeding started...");

        const adminData = {
            name: config.seedAdminConfig.name as string,
            email: config.seedAdminConfig.email as string,
            role: config.seedAdminConfig.role,
            password: config.seedAdminConfig.password,
        };

        if (!adminData.email || !adminData.password || !adminData.name) {
            throw new Error(
                `Missing seed admin fields. Got: ${JSON.stringify(adminData)}`
            );
        }

        const dbInfo = (await prisma.$queryRaw<
            { db: string; schema: string }[]
        >`select current_database() as db, current_schema() as schema;`)[0];

        console.log("Connected DB:", dbInfo);

        console.log("verifying email..");
        const existingUser = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (existingUser) {
            console.log("User already exists in DB:", existingUser.email);
            return;
        }

        console.log("calling sign-up endpoint..");
        const res = await fetch(process.env.SEED_ADMIN_URL as string, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "origin": "http://localhost:3000",
                "referer": "http://localhost:3000/",
            },
            body: JSON.stringify(adminData),
        });

        const bodyText = await res.text();
        console.log("signup status:", res.status, res.statusText);
        console.log("signup response:", bodyText);

        if (!res.ok) {
            throw new Error("Sign-up failed. User was NOT created.");
        }

        // Confirm user exists after signup
        const created = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (!created) {
            throw new Error(
                "Signup returned OK but user not found in DB. This usually means your API is using a DIFFERENT database."
            );
        }

        // Mark verified
        await prisma.user.update({
            where: { email: adminData.email },
            data: { emailVerified: true, role:config.seedAdminConfig.role },
        });

        console.log("email verified");
        console.log("admin created:", adminData.email);
    } catch (e) {
        console.error("seedAdmin error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
