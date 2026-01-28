import * as dotenv from 'dotenv';
import fs from 'fs'
import { UserRole } from '../middleware/auth';

const dotenvResult = dotenv.config();
// console.log('dotenv load result:', dotenvResult);  // Should show { parsed: { ADMIN_NAME: 'admin4', ... } } or { error: ... }
// console.log('Current working directory:', process.cwd());  // Should be C:\Level-2\first-prisma-project
// console.log('.env exists?', fs.existsSync('.env'));  // Should be true
// console.log('Raw .env content:', fs.readFileSync('.env', 'utf8'));

const seedAdminConfig = {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    role: process.env.ADMIN_ROLE as UserRole.ADMIN,
    password: process.env.ADMIN_PASS,
    url: process.env.SEED_ADMIN_URL
}

export const config = {
    seedAdminConfig
}