import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import summarizeRouter from './routes/summarize.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 8787;
const ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: ORIGINS }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/summarize', summarizeRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
