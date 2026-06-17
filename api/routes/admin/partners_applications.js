const express = require('express');
const router = express.Router();


/**
 * ADMINISTRATIVE DESK - READ ALL
 * GET /api/admin/partners/applications
 * Purpose: Fetches all partner applications for the admin panel overview grid.
 */
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: applications, error } = await supabase
      .from('partner_application')
      .select('*')
      .order('created_at', { ascending: false }); // Puts pending/newest entries at top

    if (error) throw error;

    res.status(200).json(applications);
  } catch (error) {
    console.error("Admin Fetch All Applications Failure:", error);
    res.status(500).json({ error: "Internal Server Error retrieving applications ledger." });
  }
});
/**
 * B2B PARTNER MODERATION DESK
 * POST /api/admin/partners/applications/:id/review
 * Purpose: Approves or declines an incoming partner application row.
 */
router.post('/:id/review', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { id } = req.params; //The :id from the URL string
const { action, profile_description, logo_url } = req.body; // Filled out by Admin in the popup modal!

    if (!["approve", "decline"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'decline'." });
    }

    // Fetch the target application record to extract its data payload
    const { data: application, error: fetchError } = await supabase
      .from('partner_application')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: "Target partner application record not found." });
    }

    // Handle Rejection
    if (action === 'decline') {
      const { error: updateError } = await supabase
        .from('partner_application')
        .update({ status: 'declined', processed_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        message: "Application status updated to declined. Retained for 15-day auditing cycle."
      });
    }

    // Handle Approval
    if (action === 'approve') {
      // A. Update intake tracking row status
      const { error: appUpdateError } = await supabase
        .from('partner_application')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);

      if (appUpdateError) throw appUpdateError;

      // B. Migrate application data into the partners table
      const { data: partnerRecord, error: partnerError } = await supabase
        .from('partner')
        .insert([
          {
            application_id: application.id,
            company_name: application.company_name,
            company_address: application.company_address,
            owner_name: application.owner_name,
            owner_email: application.owner_email,
            owner_phone: application.owner_phone,
            latitude: application.latitude,
            longitude: application.longitude,
           // Provided directly by Admin inside the Review Modal body
            profile_description: profile_description || "Certified Car Care Partner Facility.",
            logo_url: logo_url || null, 
            is_active: true
          }
        ])
        .select();

      if (partnerError) throw partnerError;

      return res.status(200).json({
        success: true,
        message: "Application successfully approved and migrated to active partner directory.",
        partner: partnerRecord[0]
      });
    }

  } catch (error) {
    console.error("Partner Moderation Error:", error);
    res.status(500).json({ error: "Internal Server Error executing administrative review transition." });
  }
});

module.exports = router;