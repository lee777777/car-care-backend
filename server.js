require('dotenv').config(); // loads into process.env from .env file
const express = require('express');
const morgan = require('morgan'); //logging incoming HTTP requests in terminal
const { createClient } = require('@supabase/supabase-js'); //Supabase backend database

const app = express();
app.set('trust proxy', 1); //passes the true client IP provided by NGINX and Cloudflare

app.use(express.json());
app.use(morgan('dev'));

// Instantiating Supabase
const supabase = createClient( 
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
app.locals.supabase = supabase; //dtatbase open connection globally 

// Mounting your sub-routes under the mandatory /api prefix
app.use('/api/applications', require('./api/routes/applications'));
app.use('/api/admin/partners_applications', require('./api/routes/admin/partners_applications'));
app.use('/api/admin/partners', require('./api/routes/admin/partners'));
app.use('/api/admin/inquiries', require('./api/routes/admin/inquiries'));
// app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/contact', require('./api/routes/contactUs.js'));
// app.use('/api/map', require('./routes/map.js'));

// Handle root verification request
app.get('/api', (req, res) => {
  res.status(200).json({ status: "healthy", message: "Vercel Serverless Express Engine Operational" });
});

// Always listens when running 
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {  //'0.0.0.0' tells Node.js to accept incoming network connections from outside the container (like NGINX) rather than restricting traffic strictly to localhost.
    console.log(`Backend server listening on port ${PORT}`);
  });
}

// Export the app instance for Vercel's serverless handler pipeline
module.exports = app;