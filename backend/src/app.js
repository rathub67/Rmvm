import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { prismaErrorHandler } from './lib/prisma.js';

import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import newsRouter from './routes/news.js';
import denunciasRouter from './routes/denuncias.js';
import adminRouter from './routes/admin.js';

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/news', newsRouter);
app.use('/api/denuncias', denunciasRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada."
    });
});

app.use((err, req, res, next) => {
    const error = prismaErrorHandler(err);
    const statusCode = error.status || err.status || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        error: statusCode >= 500
            ? "Erro interno do servidor."
            : error.message
    });
});

export default app;
