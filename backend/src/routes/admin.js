import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { userFilter } from '../utils/helpers.js';

const router = Router();

const STATUS = ["new", "read", "resolved"];

router.use(authenticate, requireAdmin);

router.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: userFilter
    });

    res.json({ users });
});

router.patch('/users/:id/role', async (req, res) => {
    const role = req.body.role;

    if (role !== "user" && role !== "admin") {
        throw createError(400, "Nível de acesso inválido.");
    }

    const target = await prisma.user.findUniqueOrThrow({
        where: { id: req.params.id }
    });

    if (target.id === req.user.id) {
        throw createError(400, "Você não pode alterar o seu próprio nível.");
    }

    if (target.role === "admin" && role === "user") {
        const admins = await prisma.user.count({ where: { role: "admin" } });

        if (admins <= 1) {
            throw createError(400, "O sistema precisa de pelo menos um administrador.");
        }
    }

    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: userFilter
    });

    res.json({ user });
});

router.delete('/users/:id', async (req, res) => {
    const target = await prisma.user.findUniqueOrThrow({
        where: { id: req.params.id }
    });

    if (target.id === req.user.id) {
        throw createError(400, "Você não pode excluir a sua própria conta.");
    }

    if (target.role === "admin") {
        const admins = await prisma.user.count({ where: { role: "admin" } });

        if (admins <= 1) {
            throw createError(400, "O sistema precisa de pelo menos um administrador.");
        }
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ ok: true });
});

router.get('/denuncias', async (req, res) => {
    const denuncias = await prisma.denuncia.findMany({
        orderBy: { createdAt: "desc" },
        take: 500
    });

    res.json({ denuncias });
});

router.patch('/denuncias/:id', async (req, res) => {
    const status = String(req.body.status || "").trim().toLowerCase();

    if (!STATUS.includes(status)) {
        throw createError(400, "Status da solicitação inválido.");
    }

    const denuncia = await prisma.denuncia.update({
        where: { id: req.params.id },
        data: { status }
    });

    res.json({ denuncia });
});

router.delete('/denuncias/:id', async (req, res) => {
    await prisma.denuncia.delete({ where: { id: req.params.id } });

    res.json({ ok: true });
});

export default router;
