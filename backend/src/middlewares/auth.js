import { prisma } from '../lib/prisma.js';
import createError from '../utils/createError.js';
import { verifyToken } from '../utils/jwt.js';

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError(401, "Token não informado");
    }

    const token = authHeader.split(' ')[1];

    let payload;

    try {
        payload = verifyToken(token);
    } catch (err) {
        throw createError(401, "Token inválido ou expirado");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    if (!user) {
        throw createError(401, "Conta não encontrada");
    }

    req.user = user;
    next();
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        throw createError(403, "Acesso restrito a administradores");
    }

    next();
}

export { authenticate, requireAdmin };
