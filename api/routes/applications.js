const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');




const signedUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: "Too many upload URL requests from this device. Please try again after an hour."
  }
});

// max 3 form submissions per hour per IP
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // Limit each IP to 3 form submissions per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many application submissions from this device. Please try again later."
  }
});
// custom  email templates 
const { getNewApplicationNotificationHTML } = require('../email_templats/applicationReviewNotification.js');
const { getApplicantConfirmationHTML } = require('../email_templats/applicantConfirmation.js');

const resend = new Resend(process.env.RESEND_API_KEY);
const GLOBAL_LOGO_URL = "https://thumbs.dreamstime.com/b/polishing-waxing-car-logo-design-auto-detailing-service-orbital-polish-machine-vector-scratch-remove-buffing-logotype-251168071.jpg";


async function sendEmails(formData) {
  // Destructure data
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
  } = formData;

  const adminEmail = process.env.ADMIN_EMAIL || "leen99belal@gmail.com";
  //send emails at the same time
  await Promise.all([
    // Email 1: internal admin notification of new application
    resend.emails.send({
      from: "System <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Application: ${company_name}`,
      html: getNewApplicationNotificationHTML(
        {
          companyName: company_name,
          crNumber: commercial_registration_number,
          companyAddress: company_address,
          ownerName: owner_name,
          phone: owner_phone,
          email: owner_email,
          latitude,
          longitude,
          verification_document_url
        }, 
        GLOBAL_LOGO_URL
      )
    }),

    // Email 2: Receipt Confirmation for the Applicant
    resend.emails.send({
      from: "Partner Onboarding <onboarding@resend.dev>",
      to: owner_email, // Target email dynamically pulled out of form payload fields
      subject: "Application Received - Pending Admin Review",
      html: getApplicantConfirmationHTML(
        {
          ownerName: owner_name,
          companyName: company_name,
          crNumber: commercial_registration_number,
          phone: owner_phone,
          companyAddress: company_address,
          email: owner_email
        }, 
        GLOBAL_LOGO_URL
      )
    })
  ]);
}

 
/**
 * POST /api/applications/signed-url
 *  direct client uploads
 */
router.post('/signed-url', signedUrlLimiter, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ error: "Missing filename or fileType in request body." });
    }
    const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return res.status(400).json({ error: "Invalid file type. Only PDF, JPEG, PNG, and WEBP formats are allowed." });
    }

    //  Generating randomized folder path to avoid naming collisions
    const uniqueId = crypto.randomBytes(4).toString('hex'); // e.g., 'a3b2c1d0'
    const ext = filename.includes('.') ? filename.split('.').pop().replace(/[^a-zA-Z0-9]/g, '') : '';
    const baseName = filename.substring(0, filename.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_') || 'file'; //replaces strange charechters with underscore
    const storagePath = ext ? `${uniqueId}/${baseName}.${ext}` : `${uniqueId}/${baseName}`;  //key/filename 
    // Calling Supabase Storage Engine to request a temporary Signed Upload URL
    const { data, error } = await supabase.storage
      .from('application-assets')
      .createSignedUploadUrl(storagePath, {
        upsert: false // Prevent malicious overwriting of files
      });

    if (error) throw error;

    //  Resolve the permanent public/authenticated access URL for this asset path
    const { data: publicUrlData } = supabase.storage
      .from('application-assets')
      .getPublicUrl(storagePath);

    // Return both the signed token write-link and the final structural destination link
    return res.status(200).json({
      signedUrl: data.signedUrl,         // Used by TanStack Query to execute PUT stream
      publicUrl: publicUrlData.publicUrl // Cached by frontend to pass to the /submit step
    });

  } catch (error) {
    console.error("Signed URL Handshake Failure:", error);
    return res.status(500).json({ error: "Internal Server Error during handshake token generation." });
  }
});

/**
 * B2B PARTNER submit form
 * POST /api/applications/submit
 */
router.post('/submit', submissionLimiter, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Deconstruct fields exactly as mapped by the frontend form
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
    if (!company_name || !commercial_registration_number || !verification_document_url || !owner_email) {
      return res.status(400).json({ error: "Missing required core application metadata fields." });
    }
    const parseCoord = (val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return Number.isNaN(num) ? null : num;
    };
    const parsedLat = parseCoord(latitude);
    const parsedLng = parseCoord(longitude);
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
          latitude: parsedLat,
          longitude: parsedLng,
          verification_document_url,
          status: 'pending' // Enforces standard entry state for admin review 
        }
      ])
      .select();

    if (error) throw error;
   //send email to applicant and admin of new application
    try {
      await sendEmails(req.body);
    } catch (emailError) {
    
      console.error("email notification failure:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Application committed to database ledger successfully.",
      application: data[0]
    });

  } catch (error) {
    console.error("Database Transaction Failure:", error);
    return res.status(500).json({ error: "Internal Server Error executing database submission entry." });
  }

});

module.exports = router;