import 'dotenv/config';

import app from './app.js';
import { prisma } from './lib/prisma.js';
import { criarAdmin } from './lib/seed.js';

const PORT = Number(process.env.PORT || 3001);

async function start() {
    if (!process.env.JWT_SECRET) {
        throw new Error("Defina JWT_SECRET no backend/.env");
    }

    const criado = await criarAdmin();

    app.listen(PORT, () => {
        console.log(`\n  RMVM API rodando em http://localhost:${PORT}`);
        console.log(
            `  Banco de dados: MariaDB ${process.env.DB_NAME || "backend_db"} em ${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || 3306}`
        );
        if (criado) console.log("  Administrador criado neste arranque.");
    });
}

start().catch(async (error) => {
    console.error("Falha ao iniciar a API:", error.message);
    await prisma.$disconnect();
    process.exit(1);
});
