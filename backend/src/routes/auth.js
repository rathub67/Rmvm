import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middlewares/auth.js';
import { newId, texto, userFilter } from '../utils/helpers.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/register', async (req, res) => {
    const name = texto(req.body.name);
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2 || name.length > 80) {
        throw createError(400, "Informe um nome entre 2 e 80 caracteres.");
    }

    if (!EMAIL_REGEX.test(email) || email.length > 120) {
        throw createError(400, "Informe um e-mail válido.");
    }

    if (password.length < 8 || password.length > 128) {
        throw createError(400, "A senha deve ter entre 8 e 128 caracteres.");
    }

    const existe = await prisma.user.findUnique({ where: { email } });

    if (existe) {
        throw createError(409, "Este e-mail já está cadastrado. Faça login.");
    }

    const user = await prisma.user.create({
        data: {
            id: newId('usr'),
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: "user",
            lastLoginAt: new Date(),
            loginCount: 1
        },
        select: userFilter
    });

    res.status(201).json({ token: generateToken(user), user });
});

router.post('/login', async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!EMAIL_REGEX.test(email) || !password) {
        throw createError(400, "Informe e-mail e senha.");
    }

    const encontrado = await prisma.user.findUnique({ where: { email } });
    const senhaOk = encontrado && (await bcrypt.compare(password, encontrado.password));

    if (!senhaOk) {
        throw createError(401, "E-mail ou senha inválidos.");
    }

    const user = await prisma.user.update({
        where: { id: encontrado.id },
        data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 }
        },
        select: userFilter
    });

    res.json({ token: generateToken(user), user });
});

router.post('/logout', authenticate, (req, res) => {
    res.json({ ok: true });
});

router.get('/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: userFilter
    });

    res.json({ user });
});

router.post('/password', authenticate, async (req, res) => {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw createError(400, "A senha atual está incorreta.");
    }

    if (newPassword.length < 8) {
        throw createError(400, "A nova senha deve ter pelo menos 8 caracteres.");
    }

    if (newPassword === currentPassword) {
        throw createError(400, "A nova senha precisa ser diferente da senha atual.");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(newPassword, 10) }
    });

    res.json({ ok: true, message: "Senha alterada com sucesso." });
});

router.delete('/account', authenticate, async (req, res) => {
    const password = String(req.body.password || "");
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!(await bcrypt.compare(password, user.password))) {
        throw createError(400, "A senha está incorreta.");
    }

    if (user.role === "admin") {
        const admins = await prisma.user.count({ where: { role: "admin" } });

        if (admins <= 1) {
            throw createError(400, "O sistema precisa de pelo menos um administrador.");
        }
    }

    await prisma.user.delete({ where: { id: user.id } });

    res.json({ ok: true });
});

export default router;
