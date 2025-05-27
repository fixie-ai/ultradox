// callManager.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Store Ultravox callId and provider callSid mapping when a call starts
// In prod replace the map with a database
const activeCalls = new Map();

/**
 * Register a new call in the system
 * @param {string} ultravoxCallId - The Ultravox call ID
 * @param {string} providerCallSid - The provider's call SID (e.g., Twilio Call SID)
 * @param {string} callerNumber - The caller's phone number
 * @param {string} provider - The provider name (twilio, telnyx, plivo)
 */
function registerCall(ultravoxCallId, providerCallSid, callerNumber, provider = 'twilio') {
  activeCalls.set(ultravoxCallId, {
    providerCallSid,
    callerNumber,
    provider,
    startTime: new Date()
  });
  console.log(`Call registered: ${ultravoxCallId} -> ${providerCallSid} (${provider})`);
}

/**
 * Get details about an active call
 * @param {string} ultravoxCallId - The Ultravox call ID
 * @returns {Object|null} Call data or null if not found
 */
function getCallDetails(ultravoxCallId) {
  return activeCalls.get(ultravoxCallId) || null;
}

/**
 * Transfer an active Twilio call to a destination number
 * @param {string} ultravoxCallId - The Ultravox call ID
 * @param {string} destinationNumber - The phone number to transfer to (e.g., "+15551234567")
 * @returns {Object} Result of the transfer operation
 */
async function transferTwilioCall(ultravoxCallId, destinationNumber) {
  try {
    const callData = activeCalls.get(ultravoxCallId);
    if (!callData || !callData.providerCallSid) {
      throw new Error('Call not found or invalid Call SID');
    }

    // Initialize Twilio client
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.dial().number(destinationNumber);

    // Update the active call with the new TwiML
    const updatedCall = await client.calls(callData.providerCallSid)
      .update({
        twiml: twiml.toString()
      });

    return {
      status: 'success',
      message: 'Call transfer initiated',
      callDetails: {
        ultravoxCallId,
        providerCallSid: callData.providerCallSid,
        destinationNumber,
        transferInitiated: new Date()
      }
    };

  } catch (error) {
    console.error('Error transferring call:', error);
    throw error;
  }
}

/**
 * Transfer an active call based on the provider
 * @param {string} ultravoxCallId - The Ultravox call ID
 * @param {string} destinationNumber - The phone number to transfer to
 * @returns {Object} Result of the transfer operation
 */
async function transferActiveCall(ultravoxCallId, destinationNumber) {
  const callData = activeCalls.get(ultravoxCallId);
  if (!callData) {
    throw new Error(`Call not found: ${ultravoxCallId}`);
  }

  switch (callData.provider) {
    case 'twilio':
      return await transferTwilioCall(ultravoxCallId, destinationNumber);
    case 'telnyx':
      // TODO: Implement Telnyx transfer
      throw new Error('Telnyx transfer not implemented yet');
    case 'plivo':
      // TODO: Implement Plivo transfer
      throw new Error('Plivo transfer not implemented yet');
    default:
      throw new Error(`Unsupported provider: ${callData.provider}`);
  }
}

export {
  registerCall,
  getCallDetails,
  transferActiveCall,
  activeCalls
};