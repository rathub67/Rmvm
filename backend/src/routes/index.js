import { Router } from 'express';

const router = Router();

const status = {
    status: "ok",
    api: "RMVM API"
};

router.get('/', (req, res) => {
    res.set('Cache-Control', 'no-store');
    status.timestamp = new Date().toISOString();
    res.json(status);
});

router.get('/api/status', (req, res) => {
    res.set('Cache-Control', 'no-store');
    status.timestamp = new Date().toISOString();
    res.json(status);
});

router.get('/api/health', (req, res) => {
    res.json({ ok: true, service: "rmvm-api" });
});

export default router;
