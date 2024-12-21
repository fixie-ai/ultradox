import twilio from 'twilio';
import https from 'https';

// Twilio configuration
const TWILIO_ACCOUNT_SID = 'your_twilio_account_sid_here';
const TWILIO_AUTH_TOKEN = 'your_twilio_auth_token_here';
const TWILIO_PHONE_NUMBER = 'your_twilio_phone_number_here';
const DESTINATION_PHONE_NUMBER = 'the_destination_phone_number_here';

// Ultravox configuration
const ULTRAVOX_API_KEY = 'your_ultravox_api_key_here';
const SYSTEM_PROMPT = 'Your name is Steve and you are calling a person on the phone. Ask them their name and see how they are doing.';

const ULTRAVOX_CALL_CONFIG = {
    systemPrompt: SYSTEM_PROMPT,
    model: 'fixie-ai/ultravox',
    voice: 'Mark',
    temperature: 0.3,
    firstSpeaker: 'FIRST_SPEAKER_USER',
    medium: { "twilio": {} }
};

const ULTRAVOX_API_URL = 'https://api.ultravox.ai/api/calls';

async function createUltravoxCall() {
    const request = https.request(ULTRAVOX_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': ULTRAVOX_API_KEY
        }
    });

    return new Promise((resolve, reject) => {
        let data = '';

        request.on('response', (response) => {
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(JSON.parse(data)));
        });

        request.on('error', reject);
        request.write(JSON.stringify(ULTRAVOX_CALL_CONFIG));
        request.end();
    });
}

async function main() {
    try {
        console.log('Creating Ultravox call...');
        const { joinUrl } = await createUltravoxCall();
        console.log('Got joinUrl:', joinUrl);

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const call = await client.calls.create({
            twiml: `<Response><Connect><Stream url="${joinUrl}"/></Connect></Response>`,
            to: DESTINATION_PHONE_NUMBER,
            from: TWILIO_PHONE_NUMBER
        });

        console.log('Call initiated:', call.sid);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();