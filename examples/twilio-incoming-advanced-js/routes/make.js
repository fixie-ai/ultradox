import express from 'express';
import 'dotenv/config';
import { getCallTranscript } from '../ultravox-utils.js';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  console.log('Incoming UV Webhook!');

  try {
    const data = req.body;

    // Call ended event...let's get the transcript and send to Make
    if (data.event === "call.ended") {
      // Use CallID and use UV REST API to get transcript
      const transcript = await getCallTranscript(data.call.callId);
      const postBody = {
        "callId": data.call.callId,
        "transcript": transcript
      };

      // Send the transcript to Make.com incoming webhook
      const makeResponse = await fetch(process.env.MAKE_INCOMING_WH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
