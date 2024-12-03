## Twilio Outgoing Call Example

This example shows how to make an outgoing Ultravox call using Twilio.

### Installation
This project uses `pnpm`.

`pnpm install`

### Usage
1. **Create Ultravox Call** → Use the Ultravox API to [create a call](http://docs.ultravox.ai/api/calls/#create-call) and get a `joinUrl`.

*Note: you must set two additional parameters for the Twilio call in the request body:*

```javascript
{
  ...
  "firstSpeaker": "FIRST_SPEAKER_USER",
  "medium": { "twilio": {} }
}
```

You will use the new `joinUrl` in the next step.

2. **Env Variables** → Create a file called `.env` and add set the following variables

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
PHONE_NUMBER=phone_number_to_call
UV_JOIN_URL=ultravox_join_url
```

*Note: Phone numbers should include country code. E.g. for a US phone number it would look something like `+11234567890`*

3. **Run** → Make the call by running `pnpm dev`.

