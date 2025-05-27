// apiServer.js
import express from 'express';
import morgan from 'morgan';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { transferActiveCall, getCallDetails } from './callManager.js';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

let publicUrl;

// Simple API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized: Invalid or missing API key' 
    });
  }
  
  next();
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    server: {
      local: `http://localhost:${process.env.API_PORT || 3000}`,
      public: publicUrl || 'Not available yet'
    }
  });
});

// Get call details
app.get('/api/calls/:callId', validateApiKey, (req, res) => {
  const { callId } = req.params;
  const callDetails = getCallDetails(callId);
  
  if (!callDetails) {
    return res.status(404).json({ 
      status: 'error',
      message: `Call not found: ${callId}`
    });
  }
  
  res.json({
    status: 'success',
    data: {
      ultravoxCallId: callId,
      ...callDetails,
      // Don't expose sensitive data
      providerCallSid: callDetails.providerCallSid.substring(0, 5) + '...',
    }
  });
});

// Transfer call endpoint
app.post('/api/transfer', validateApiKey, async (req, res) => {
  try {
    const { ultravoxCallId, destinationNumber } = req.body;
    
    // Validate input
    if (!ultravoxCallId || !destinationNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: ultravoxCallId and destinationNumber'
      });
    }
    
    // Validate phone number format
    if (!/^\+[1-9]\d{1,14}$/.test(destinationNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number format. Must be E.164 format (e.g., +15551234567)'
      });
    }
    
    // Attempt to transfer the call
    const result = await transferActiveCall(ultravoxCallId, destinationNumber);
    
    res.json({
      status: 'success',
      data: result
    });
    
  } catch (error) {
    console.error('Transfer API error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

/**
 * Start the API server
 * @param {number} port - Port to listen on
 * @param {string} ngrokUrl - Ngrok URL (if used)
 * @returns {Promise<Object>} The HTTP server instance 
 */
async function startApiServer(port = 3000, ngrokUrl) {
  publicUrl = ngrokUrl;
  // Start the Express server
  const server = app.listen(port, () => {
    console.log(`API Server listening on port ${port}`);
  });
  
  return {
    server
  };
}

export { startApiServer };
