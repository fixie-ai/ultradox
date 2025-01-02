# Ultravox Twilio Incoming Call Advanced

This Node.js application demonstrates how to handle incoming Twilio calls and connect them to an Ultravox AI agent. When someone calls your Twilio number, they'll be connected to an AI agent that will interact with them. This example extends the `twilio-incoming-quickstart-js` example in the following ways:
1. Adds tools for various use cases:
* Knowledge Lookup (RAG)
* Checking Calendar Availability (using Cal.com)
* Processing Call Transcript (using Make.com)
* Transferring the Call (using Twilio)

Note: This example is using a pre-release version of the upcoming Ultravox Corpus Service for RAG. You can easily substitute in your current RAG/vector DB system. If you want early access to the Ultravox Corpus Service, please let us know on [this Discord thread](https://discord.com/channels/1240071833798184990/1323352273165881426/1323352273165881426).

## Video Walk-Through

There is a [video](https://youtu.be/sa9uF5Rr9Os) that walks through this code.

## Prerequisites

- Node.js (v14 or higher)
- An Ultravox API key
- A Twilio account with:
  - Account SID
  - Auth Token
  - A phone number
- A Cal.com account with:
  - API key
  - Existing event type
- A Make.com account with an incoming webhook setup
- A vector DB or other service for RAG
- A way to expose your local server to the internet (e.g., ngrok)

## Setup

1. Clone this repository
2. Install dependencies:
```bash
pnpm install
```

3. Configure using your API secrets and other URLs
   Create a file named `.env` and add the following variables:

```bash
CALCOM_API_KEY='your_cal_api_key_here'
CALCOM_EVENT_TYPE_ID='the_cal_event_type_id'
ULTRAVOX_API_KEY='your_ultravox_api_key_here'
MAKE_INCOMING_WH='your_make_incoming_webhook_url_here'
FIXIE_CORPUS_ID='your_corpus_id_here'
FIXIE_API_KEY='your_fixie_api_key_here'
TWILIO_ACCOUNT_SID='your_twilio_account_sid__here'
TWILIO_AUTH_TOKEN='your_twilio_auth_token_here'
DESTINATION_PHONE_NUMBER='your_destination_phone_number_here'
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

7. Set your ngrok URL:
   Open `ultravox-config.js` and update this:
```javascript
const toolsBaseUrl = "https://247e-88-16-973-488.ngrok-free.app"; // TODO ngrok URL here
```

7. Configure your Twilio webhook:
   - Go to your Twilio phone number settings
   - Set the webhook URL for incoming calls to:
     `https://your-ngrok-url/twilio/incoming`
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