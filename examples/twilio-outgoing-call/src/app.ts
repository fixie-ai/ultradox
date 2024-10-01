import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Call setup
const phoneNumber: string = process.env.PHONE_NUMBER || '';
const joinUrl: string = process.env.UV_JOIN_URL || '';

// Twilio credentials
const accountSid: string = process.env.TWILIO_ACCOUNT_SID || '';
const authToken: string = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber: string = process.env.TWILIO_PHONE_NUMBER || '';

// Check if Twilio credentials are set
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function initiateCall(phoneNumber: string, joinUrl: string): Promise<string> {
  try {
    const call = await client.calls.create({
      twiml: `<Response><Connect><Stream url="${joinUrl}"/></Connect></Response>`,
      to: phoneNumber,
      from: twilioPhoneNumber
    });
    console.log('Call initiated:', call.sid);
    return call.sid;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
}


initiateCall(phoneNumber, joinUrl)
  .then((callSid) => {
    console.log(`Call successfully initiated with SID: ${callSid}`);
  })
  .catch((error) => {
    console.error('Failed to initiate call:', error);
  });