const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Abra Cardabra API Server is running!' });
});

// API routes will be added here
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`🚀 Abra Cardabra API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔑 Google API Key: ${process.env.GOOGLE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔑 Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
});
