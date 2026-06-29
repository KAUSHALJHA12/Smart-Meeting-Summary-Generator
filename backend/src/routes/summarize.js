import { Router } from 'express';
import { summarizeAll, regenerateSection } from '../services/summarizer.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { transcript } = req.body || {};
    if (typeof transcript !== 'string' || transcript.trim().length < 10) {
      return res
        .status(400)
        .json({ error: 'transcript is required and must be at least 10 characters.' });
    }
    const result = await summarizeAll(transcript);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/section', async (req, res, next) => {
  try {
    const { transcript, section, existing } = req.body || {};
    if (typeof transcript !== 'string' || transcript.trim().length < 10) {
      return res.status(400).json({ error: 'transcript is required.' });
    }
    if (!section) {
      return res.status(400).json({ error: 'section is required.' });
    }
    const result = await regenerateSection(transcript, section, existing);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
