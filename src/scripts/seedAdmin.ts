

import { config } from "../config/config";
import { prisma } from "../lib/prisma";

// const dotenvResult = dotenv.config();
// console.log('dotenv load result:', dotenvResult);  // Should show { parsed: { ADMIN_NAME: 'admin4', ... } } or { error: ... }
// console.log('Current working directory:', process.cwd());  // Should be C:\Level-2\first-prisma-project
// console.log('.env exists?', fs.existsSync('.env'));  // Should be true
// console.log('Raw .env content:', fs.readFileSync('.env', 'utf8'));

async function seedAdmin() {
    try {
        console.log('admin seeding started...');
        const adminData = {
            name: config.seedAdminConfig.name as string,
            email: config.seedAdminConfig.email as string,
            role: config.seedAdminConfig.role,
            password: config.seedAdminConfig.password,
        }
        // console.log(adminData)
        // check if the user exists already or not
        console.log('verifying email..')
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if (existingUser) {
            throw new Error("User already exists")
        };
        console.log('creating admin..');

        await new Promise<void>((resolve) => {
            let count = 0;
            const max = 45;
            const interval = setInterval(() => {
                process.stdout.write('=');
                count++;
                if (count >= max) {
                    clearInterval(interval);
                    process.stdout.write('\n'); // Move to next line after completion
                    resolve();
                }
            }, 50); // Adjust delay (ms) for speed; lower = faster animation
        });

        const signUpAdmin = await fetch(config.seedAdminConfig.url as string, {
            method: "POST",
            headers: { "content-type": 'application/json' },
            body: JSON.stringify(adminData)
        });

        // console.log(signUpAdmin)

        if (signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            });

            console.log('email verified')
        }
        console.log('admin created')
    }
    catch (e) {
        console.error(e);
    }
};

seedAdmin()