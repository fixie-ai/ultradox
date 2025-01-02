import express from 'express';
import 'dotenv/config'

const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Import our routes and mount them
import { router as twilioRoutes } from './routes/twilio.js';
import { router as makeRoutes } from './routes/make.js';
import { router as calRoutes } from './routes/cal.js';
import { router as ragRoutes } from './routes/rag.js';

app.use('/twilio/', twilioRoutes);
app.use('/make/', makeRoutes);
app.use('/cal/', calRoutes);
app.use('/rag/', ragRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});