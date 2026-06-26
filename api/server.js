require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Global Middleware Config
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Instantiating Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
app.locals.supabase = supabase;

// Mounting your sub-routes under the mandatory /api prefix
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin/partners_applications', require('./routes/admin/partners_applications'));
app.use('/api/admin/partners', require('./routes/admin/partners'));
app.use('/api/admin/inquiries', require('./routes/admin/inquiries'));
// app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/contact', require('./routes/contactUs.js'));
// app.use('/api/map', require('./routes/map.js'));

// Handle root verification request
app.get('/api', (req, res) => {
  res.status(200).json({ status: "healthy", message: "Vercel Serverless Express Engine Operational" });
});

// CRITICAL ADJUSTMENT: Only listen to explicit ports locally!
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local Development Engine running at http://localhost:${PORT}`);
  });
}

// Export the app instance for Vercel's serverless handler pipeline
module.exports = app;