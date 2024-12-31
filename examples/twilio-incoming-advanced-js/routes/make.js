import express from 'express';
import 'dotenv/config';
import { getCallTranscript } from '../ultravox-utils.js';

const router = express.Router();

// Use CallID and use UV REST API to get transcript
// Send transcript to Make.com webhook
router.post('/webhook', async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
        let chunks = '';
        
        req.on('data', chunk => {
            chunks += chunk;
        });
        
        req.on('end', () => {
            try {
                resolve(JSON.parse(chunks));
            } catch (err) {
                reject(err);
            }
        });
        
        req.on('error', reject);
    });

    // Only process if it's call ended
    if (data.event === "call.ended") {
      const transcript = await getCallTranscript(data.call.callId);
      const postBody = {
        "callId": data.call.callId,
        "transcript": transcript
      };

      // Send the transcript to Make.com
      const makeResponse = await fetch(process.env.MAKE_INCOMING_WH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/jscon' },
        body: JSON.stringify(postBody)
      });

      console.log(`response: ${makeResponse.status}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export { router };
