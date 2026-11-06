import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import createError from '../utils/createError.js';

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'backend_db'
});

const prisma = new PrismaClient({ adapter });

function prismaErrorHandler(error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return error;
    }

    switch (error.code) {
        case 'P2002':
            return createError(409, "Já existe um registro com estes dados (chave duplicada).");
        case 'P2025':
            return createError(404, "O registro não existe");
        default:
            return error;
    }
}

export { prisma, prismaErrorHandler };
