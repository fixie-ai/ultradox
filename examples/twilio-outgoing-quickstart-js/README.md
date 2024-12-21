# Ultravox Twilio Outgoing Call Quickstart

This Node.js application demonstrates how to make outgoing phone calls using Ultravox AI and Twilio. It sets up an AI-powered phone call where the AI agent (named Steve) will interact with the call recipient.

## Prerequisites

- Node.js (v14 or higher)
- An Ultravox API key
- A Twilio account with:
  - Account SID
  - Auth Token
  - A phone number

## Setup

1. Clone this repository
2. Install dependencies:
```bash
pnpm install
```

3. Configure your environment:
   Open `index.js` and update the following constants with your credentials:

```javascript
const ULTRAVOX_API_KEY = 'your_ultravox_api_key_here';
const TWILIO_ACCOUNT_SID = 'your_twilio_account_sid_here';
const TWILIO_AUTH_TOKEN = 'your_twilio_auth_token_here';
const TWILIO_PHONE_NUMBER = 'your_twilio_phone_number_here';
const DESTINATION_PHONE_NUMBER = 'the_destination_phone_number_here';
```

4. (Optional) Modify the AI system prompt:
```javascript
const SYSTEM_PROMPT = 'Your name is Steve and you are calling...';
```

## Running the Application

Start the application using either:
```bash
pnpm start
```

The application will:
1. Create an Ultravox call session
2. Initiate a phone call through Twilio
3. Connect the AI agent to the call

## Console Output

When running successfully, you should see something like:
```
Creating Ultravox call...
Got joinUrl: https://...
Call initiated: CA1234...
```

## Troubleshooting

If you encounter errors:
1. Verify all API keys and credentials are correct
2. Ensure the destination phone number is in a valid format (e.g., +1234567890)
3. Check that your Twilio number is capable of making outbound calls

## Project Structure

- `index.js` - Main application file containing the call logic
- `package.json` - Project dependencies and scripts
- `README.md` - This documentation file