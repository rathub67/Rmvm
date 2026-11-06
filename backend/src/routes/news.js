import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { newId, texto } from '../utils/helpers.js';

const router = Router();

function lerNoticia(body) {
    const title = texto(body.title);
    const rawUrl = String(body.url || "").trim();

    if (!title || title.length > 160) {
        return { error: "O título deve ter entre 1 e 160 caracteres." };
    }

    if (!rawUrl || rawUrl.length > 2000) {
        return { error: "Informe o link da notícia." };
    }

    let url;

    try {
        url = new URL(rawUrl);
    } catch (err) {
        return { error: "Informe um link válido, começando por http:// ou https://." };
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { error: "O link deve usar http:// ou https://." };
    }

    return { title, url: url.toString() };
}

router.get('/', async (req, res) => {
    const news = await prisma.news.findMany({
        orderBy: { updatedAt: "desc" }
    });

    res.json({ news });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
    const dados = lerNoticia(req.body);

    if (dados.error) {
        throw createError(400, dados.error);
    }

    const news = await prisma.news.create({
        data: {
            id: newId('news'),
            title: dados.title,
            url: dados.url,
            authorId: req.user.id,
            authorName: req.user.name
        }
    });

    res.status(201).json({ news });
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
    const existe = await prisma.news.findUnique({
        where: { id: req.params.id }
    });

    if (!existe) {
        throw createError(404, "Notícia não encontrada.");
    }

    const dados = lerNoticia(req.body);

    if (dados.error) {
        throw createError(400, dados.error);
    }

    const news = await prisma.news.update({
        where: { id: req.params.id },
        data: { title: dados.title, url: dados.url }
    });

    res.json({ news });
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    const existe = await prisma.news.findUnique({
        where: { id: req.params.id }
    });

    if (!existe) {
        throw createError(404, "Notícia não encontrada.");
    }

    await prisma.news.delete({ where: { id: req.params.id } });

    res.json({ ok: true });
});

export default router;
