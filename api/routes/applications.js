const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * ADMINISTRATIVE ROUTE
 * GET /api/applications/
 * Purpose: Fetches all partner applications from Supabase for the Admin Panel.
 */
router.get('/', async (req, res) => {
  try {
    // Safely pull the active serverless supabase token context
    const supabase = req.app.locals.supabase; //pulls a single, pre-initialized master Supabase instance that lives in global application memory
    
    const { data, error } = await supabase
      .from('partner_application')
      .select('*')
      .order('created_at', { ascending: false }); // Groups newest applications at the top

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Administrative Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * B2B PARTNER INTAKE - PHASE 1
 * POST /api/applications/signed-url
 * Purpose: Generates a secure, temporary write-token for unauthenticated direct client uploads.
 */
router.post('/signed-url', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ error: "Missing filename or fileType in request body." });
    }

    // 1. Generate a clean, randomized folder path to avoid naming collisions
    const uniqueId = crypto.randomBytes(4).toString('hex'); // e.g., 'a3b2c1d0'
    const cleanFileName = filename.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `${uniqueId}/${cleanFileName}`;

    // 2. Call Supabase Storage Engine to request a temporary Signed Upload URL
    // This uses your Master Service Role Key safely behind the scenes
    const { data, error } = await supabase.storage
      .from('application-assets')
      .createSignedUploadUrl(storagePath, {
        upsert: false // Prevent malicious overwriting of files
      });

    if (error) throw error;

    // 3. Resolve the permanent public/authenticated access URL for this asset path
    const { data: publicUrlData } = supabase.storage
      .from('application-assets')
      .getPublicUrl(storagePath);

    // 4. Return both the signed token write-link and the final structural destination link
    res.status(200).json({
      signedUrl: data.signedUrl,         // Used by TanStack Query to execute PUT stream
      publicUrl: publicUrlData.publicUrl // Cached by frontend to pass to the /submit step
    });

  } catch (error) {
    console.error("Signed URL Handshake Failure:", error);
    res.status(500).json({ error: "Internal Server Error during handshake token generation." });
  }
});

/**
 * B2B PARTNER INTAKE - PHASE 2
 * POST /api/applications/submit
 * Purpose: Commits clean text metadata and verified storage strings to PostgreSQL.
 */
router.post('/submit', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Deconstruct fields exactly as mapped by your frontend TanStack Form layout
    const {
      company_name,
      commercial_registration_number,
      company_address,
      owner_name,
      owner_email,
      owner_phone,
      latitude,
      longitude,
      verification_document_url
    } = req.body;

    // Validate presence of critical data layers
    if (!company_name || !commercial_registration_number || !verification_document_url) {
      return res.status(400).json({ error: "Missing required core application metadata fields." });
    }

    // Insert text data payload and asset links into Supabase PostgreSQL
    const { data, error } = await supabase
      .from('partner_application')
      .insert([
        {
          company_name,
          commercial_registration_number,
          company_address,
          owner_name,
          owner_email,
          owner_phone,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          verification_document_url,
          status: 'pending' // Enforces standard entry state for admin review 
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Application committed to database ledger successfully.",
      application: data[0]
    });

  } catch (error) {
    console.error("Database Transaction Failure:", error);
    res.status(500).json({ error: "Internal Server Error executing database submission entry." });
  }
});

module.exports = router;