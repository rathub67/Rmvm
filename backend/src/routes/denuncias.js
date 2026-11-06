import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { newId, texto } from '../utils/helpers.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PERGUNTAS = ["q1", "q2", "q3", "q4", "q5", "q7", "q8", "q9", "q11"];

function lerDenuncia(body) {
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
        return { error: "Informe um e-mail válido para contato." };
    }

    const raw = body.answers;

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { error: "Envie as respostas do formulário." };
    }

    const answers = {};

    for (const key of Object.keys(raw)) {
        if (!/^q\d{1,2}$/.test(key)) continue;

        const value = raw[key];

        if (Array.isArray(value)) {
            const list = value
                .map((item) => texto(item).slice(0, 500))
                .filter(Boolean)
                .slice(0, 20);

            if (list.length > 0) answers[key] = list;
        } else {
            const item = texto(value).slice(0, 500);

            if (item) answers[key] = item;
        }
    }

    for (const key of PERGUNTAS) {
        const value = answers[key];

        if (!value || (Array.isArray(value) && value.length === 0)) {
            return { error: "Responda a todas as perguntas obrigatórias do formulário." };
        }
    }

    return { email, answers };
}

router.post('/', async (req, res) => {
    const dados = lerDenuncia(req.body);

    if (dados.error) {
        throw createError(400, dados.error);
    }

    const denuncia = await prisma.denuncia.create({
        data: {
            id: newId('den'),
            email: dados.email,
            answers: dados.answers,
            ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
                .split(",")[0]
                .trim()
                .replace(/^::ffff:/, "") || "desconhecido",
            userAgent: String(req.headers["user-agent"] || "").slice(0, 300)
        }
    });

    res.status(201).json({
        denuncia: {
            id: denuncia.id,
            createdAt: denuncia.createdAt
        }
    });
});

export default router;
