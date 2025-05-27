import twilio from 'twilio';
import https from 'https';
import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid';
import { registerCall } from './callManager.js';
import { startApiServer } from './apiServer.js';
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

// Get our environment variables from .env file
dotenv.config();
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const DESTINATION_PHONE_NUMBER = process.env.DESTINATION_PHONE_NUMBER;
const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;
const API_PORT = process.env.API_PORT || 3000;
const SERVICE_API_KEY = process.env.API_KEY;

// TODO: manually set ngrok URL
// Use ngrok if available...otherwise localhost
const ngrokUrl = "https://5c34-208-52-88-90.ngrok-free.app";
const baseUrl = ngrokUrl || `https://localhost:${API_PORT}`;

// Ultravox configuration
const ULTRAVOX_API_URL = 'https://api.ultravox.ai/api/calls';
const SYSTEM_PROMPT = 'Your name is Steve and you are calling a person on the phone. Ask them their name and see how they are doing.';
const getAgentTools = (baseUrl) => {
    return [
        {
            "temporaryTool": {
                "modelToolName": "transferCall",
                "description": "Transfers call to a human. Use this if a caller is upset or if there are questions you cannot answer.",
                "requirements": {
                    "httpSecurityOptions": {
                        "options": [
                            {
                                "requirements": {
                                    "api_key_auth": {
                                        "headerApiKey": {
                                            "name": "X-API-Key"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "automaticParameters": [
                    {
                        "name": "ultravoxCallId",
                        "location": "PARAMETER_LOCATION_BODY",
                        "knownValue": "KNOWN_PARAM_CALL_ID"
                    }
                ],
                "staticParameters": [
                    {
                        "name": "destinationNumber",
                        "location": "PARAMETER_LOCATION_BODY",
                        "value": DESTINATION_PHONE_NUMBER
                    }
                ],
                "dynamicParameters": [
                {
                    "name": "firstName",
                    "location": "PARAMETER_LOCATION_BODY",
                    "schema": {
                    "description": "The caller's first name",
                    "type": "string",
                    },
                    "required": true,
                },
                {
                    "name": "lastName",
                    "location": "PARAMETER_LOCATION_BODY",
                    "schema": {
                        "description": "The caller's last name",
                        "type": "string",
                    },
                    "required": true,
                },
                {
                    "name": "transferReason",
                    "location": "PARAMETER_LOCATION_BODY",
                    "schema": {
                        "description": "The reason the call is being transferred.",
                        "type": "string",
                    },
                    "required": true,
                },
                ],
                "http": {
                    "baseUrlPattern": `${baseUrl}/api/transfer`,
                    "httpMethod": "POST",
                },
            },
            "authTokens": {
                "api_key_auth": SERVICE_API_KEY
            },
        }
    ];
}

const getUltravoxCallConfig = (provider, baseUrl) => {
    const selectedTools = getAgentTools(baseUrl);
    console.log("tools: " + JSON.stringify(selectedTools));

    return {
        systemPrompt: SYSTEM_PROMPT,
        model: 'fixie-ai/ultravox',
        voice: 'Mark',
        temperature: 0.3,
        firstSpeakerSettings: { user: {} },
        selectedTools: selectedTools,
        medium: { [provider]: {} }
    };
};

async function createUltravoxCall(provider, baseUrl) {
    const callConfig = getUltravoxCallConfig(provider, baseUrl);
    console.log(`Creating Ultravox call with ${provider} as medium...`);
    console.log('Call configuration:', JSON.stringify(callConfig, null, 2));
    
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
            console.log(`Ultravox API response status: ${response.statusCode} ${response.statusMessage}`);
            
            // Log all headers for debugging
            console.log('Response headers:', response.headers);
            
            response.on('data', chunk => {
                data += chunk;
                console.log(`Received data chunk: ${chunk.length} bytes`);
            });
            
            response.on('end', () => {
                console.log('Complete response data:', data);
                
                try {
                    const parsedData = JSON.parse(data);
                    
                    // If we got a 400 or other error status
                    if (response.statusCode >= 400) {
                        console.error('ERROR: API request failed with status', response.statusCode);
                        console.error('Error details:', JSON.stringify(parsedData, null, 2));
                        
                        // Extra detailed error info for 400 errors
                        if (response.statusCode === 400) {
                            console.error('BAD REQUEST (400) ERROR DETAILS:');
                            
                            // Check for common error structures
                            if (parsedData.error) console.error('Error message:', parsedData.error);
                            if (parsedData.message) console.error('Message:', parsedData.message);
                            if (parsedData.details) console.error('Details:', parsedData.details);
                            if (parsedData.validationErrors) console.error('Validation errors:', parsedData.validationErrors);
                            
                            // Log the tools configuration for debugging
                            if (callConfig.selectedTools) {
                                console.error('Tools configuration that caused the error:');
                                console.error(JSON.stringify(callConfig.selectedTools, null, 2));
                            }
                            
                            reject(new Error(`Bad Request: ${JSON.stringify(parsedData)}`));
                        } else {
                            reject(new Error(`API request failed with status ${response.statusCode}: ${JSON.stringify(parsedData)}`));
                        }
                    } else {
                        console.log('API request succeeded');
                        resolve(parsedData);
                    }
                } catch (error) {
                    console.error('Failed to parse response data. Raw response:', data);
                    reject(new Error(`Failed to parse Ultravox response: ${error.message}. Raw response: ${data}`));
                }
            });
        });

        request.on('error', (error) => {
            console.error('Network error during API call:', error.message);
            console.error('Error stack:', error.stack);
            reject(error);
        });

        // Log the actual payload being sent
        const jsonPayload = JSON.stringify(callConfig);
        console.log('Sending request payload:', jsonPayload);
        
        request.write(jsonPayload);
        request.end();
    });
}

async function initiateCallWithProvider(provider, ultravoxResponse) {
    switch(provider) {
        case 'twilio':
            return await initiateCallWithTwilio(ultravoxResponse);
        case 'telnyx':
            // TODO: Implement Telnyx call initiation
            throw new Error('Telnyx integration not implemented yet');
        case 'plivo':
            // TODO: Implement Plivo call initiation
            throw new Error('Plivo integration not implemented yet');
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

async function initiateCallWithTwilio(ultravoxResponse) {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const call = await client.calls.create({
        twiml: `<Response><Connect><Stream url="${ultravoxResponse.joinUrl}"/></Connect></Response>`,
        to: DESTINATION_PHONE_NUMBER,
        from: TWILIO_PHONE_NUMBER
    });
    
    return {
        sid: call.sid,
        provider: 'twilio',
        status: call.status
    };
}

async function main() {
    try {
        // Start the API server
        const { server } = await startApiServer(API_PORT, ngrokUrl);

        // Determine which provider to use (default to Twilio)
        const provider = process.argv[2] || 'twilio';
        console.log(`Using provider: ${provider}`);
        
        // Validate the provider
        const validProviders = ['twilio', 'telnyx', 'plivo'];
        if (!validProviders.includes(provider)) {
            console.error(`Invalid provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
            process.exit(1);
        }

        // Create Ultravox call with the selected provider        
        const ultravoxResponse = await createUltravoxCall(provider, baseUrl);
        if (ultravoxResponse.joinUrl) {
            console.log('Ultravox call created:', ultravoxResponse.callId);
            console.log('Got joinUrl:', ultravoxResponse.joinUrl);

            try {
                // Initiate call with the appropriate provider
                const callResult = await initiateCallWithProvider(provider, ultravoxResponse);
                console.log(`Call initiated with ${provider}:`, callResult.sid);
                
                // Register the call in our system
                registerCall(
                    ultravoxResponse.callId, 
                    callResult.sid, 
                    DESTINATION_PHONE_NUMBER,
                    provider
                );
                
                console.log('Call registered in the system.');
                
            } catch (providerError) {
                console.error(`Error with ${provider} integration:`, providerError.message);
                if (provider !== 'twilio') {
                    console.log('Falling back to Twilio...');
                    // Could implement fallback to Twilio here if needed
                }
            }
        }

        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
