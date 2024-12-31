import express from 'express';
import 'dotenv/config';
import { corpusLookup } from '../ultravox-utils.js';

const router = express.Router();

// Knowledge Base lookup
router.post('/kblookup', async (req, res) => {
  try {
      console.log('KB lookup request received');
      const { ...corpusQueryData } = req.body;

      const results = await corpusLookup(corpusQueryData.query);
      res.status(200).json({ results });

  } catch (error) {
      console.error('Error handling KB lookup:', error);
      res.status(500);
  }
});

export { router };