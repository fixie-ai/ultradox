// const express = require('express');
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// const cors = require('cors');
// const axios = require('axios');
// require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// The Ultravox API base URL
const ULTRAVOX_API_URL = 'https://api.ultravox.ai/api/calls';

// The API key should be stored in a .env file
const API_KEY = process.env.ULTRAVOX_API_KEY;

app.post('/startCall', async (req, res) => {
  console.log(`Received request to start call with systemPrompt: ${req.body.systemPrompt}`);

  try {
      // Extract systemPrompt from request body, or use a default value
      const { systemPrompt = "You are a helpful assistant." } = req.body;

      // Prepare the payload for the Ultravox API
      const payload = {
          model: 'fixie-ai/ultravox-v0.2', // Hardcoded model
          temperature: 0.8, // Hardcoded temperature
          systemPrompt: systemPrompt
      };

      // Make the POST request to Ultravox API
      console.log(`About to call Ultravox API with payload: ${JSON.stringify(payload)}`);
      const response = await axios.post(ULTRAVOX_API_URL, payload, {
          headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY
          }
      });

      // Return the payload received from the Ultravox API
      console.log(`Received response from Ultravox API: ${JSON.stringify(response.data)}`);
      res.json(response.data);
    } catch (error) {
        console.error('Error calling Ultravox API:', error.message);
        res.status(500).json({ error: 'Failed to start call', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});