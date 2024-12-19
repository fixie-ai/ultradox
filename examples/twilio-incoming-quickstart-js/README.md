# Ultravox Twilio Incoming Call Quickstart

This Node.js application demonstrates how to handle incoming Twilio calls and connect them to an Ultravox AI agent. When someone calls your Twilio number, they'll be connected to an AI agent that will interact with them.

## Prerequisites

- Node.js (v14 or higher)
- An Ultravox API key
- A Twilio account with:
  - Account SID
  - Auth Token
  - A phone number
- A way to expose your local server to the internet (e.g., ngrok)

## Setup

1. Clone this repository
2. Install dependencies:
```bash
pnpm install
```

3. Configure your environment:
   Open `index.js` and update the following constant:

```javascript
const ULTRAVOX_API_KEY = 'your_ultravox_api_key_here';
```

4. (Optional) Modify the AI system prompt:
```javascript
const SYSTEM_PROMPT = 'Your name is Steve...';
```

5. Start your server:
```bash
pnpm start
```

6. Expose your local server:
   Use ngrok or similar to create a public URL:
```bash
ngrok http 3000
```

7. Configure your Twilio webhook:
   - Go to your Twilio phone number settings
   - Set the webhook URL for incoming calls to:
     `https://your-ngrok-url/incoming`
   - Make sure the HTTP method is set to POST

## Testing

1. Call your Twilio phone number
2. You should be connected to the AI agent
3. Check your server console for logs

## Console Output

When receiving a call, you should see:
```
Server running on port 3000
Incoming call received
```

## Troubleshooting

If calls aren't connecting:
1. Verify your Ultravox API key is correct
2. Check that your ngrok URL is properly set in Twilio
3. Ensure your server is running and accessible
4. Check the server logs for any errors
5. Verify Twilio is sending webhooks (check Twilio console logs)

## Project Structure

- `index.js` - Main server file containing the webhook handler
- `package.json` - Project dependencies and scripts
- `README.md` - This documentation file