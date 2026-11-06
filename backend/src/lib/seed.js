import bcrypt from 'bcryptjs';

import { prisma } from './prisma.js';
import { newId } from '../utils/helpers.js';

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "admin@rmvm.com")
    .trim()
    .toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrador RMVM";

async function criarAdmin() {
    const existe = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL }
    });

    if (existe) return false;

    await prisma.user.create({
        data: {
            id: newId('usr'),
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: await bcrypt.hash(ADMIN_PASSWORD, 10),
            role: "admin",
            createdAt: new Date(),
            lastLoginAt: null,
            loginCount: 0
        }
    });

    return true;
}

export { criarAdmin };
