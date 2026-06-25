const express = require('express');
const router = express.Router();


/**
 * Admin Read
 * GET /api/admin/applications
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
 * B2B Paetner Application Review to accept or decline
 * POST /api/admin/applications/:id/review
 */
router.post('/:id/review', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { id } = req.params; //The :id from the URL string
    const { action} = req.body; // Filled out by Admin in the popup modal!

   if (!["approve", "decline", "pending"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve', 'pending' or 'decline'." });
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

    //if admin changed their mind and want it to set it backe to pending
   if (action === 'pending') {
      const { error: updateError } = await supabase
        .from('partner_application')
        .update({ 
          status: 'pending', 
          processed_at: null //  Resets processing stamp
        })
        .eq('id', id);

      if (updateError) throw updateError;

   const { error: deleteError } = await supabase
        .from('partner')
        .delete()
        .eq('application_id', id); // this is application's unique ID

      if (deleteError) throw deleteError;

      return res.status(200).json({
        success: true,
        message: "Application shifted to pending for further evaluation. Associated partner record has been deleted."
      });}
    // Handle Approval
    if (action === 'approve') {
      // Update row status
      const { error: appUpdateError } = await supabase
        .from('partner_application')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);

      if (appUpdateError) throw appUpdateError;

      // move application data into the partners table
      const { data: partnerRecord, error: partnerError } = await supabase
        .from('partner')
        .insert([
          {
            application_id: application.id,
            company_name: application.company_name,
            company_address: application.company_address,
            company_number: application.owner_phone,
            latitude: application.latitude,
            longitude: application.longitude,
           // Provided directly by Admin inside the Review Modal body
            company_bio:  "Certified Car Care Partner Facility.",
            company_logo_url:  null, 
            is_active: true,
            info_status: "incomplete",
            processed_by:  null //

          }
        ])
        .select();

      if (partnerError) throw partnerError;

      return res.status(200).json({
        success: true,
        message: "Application successfully approved and migrated to the active partner table.",
        partner: partnerRecord[0]
      });
    }

  } catch (error) {
    console.error("Partner Moderation Error:", error);
    res.status(500).json({ error: "Internal Server Error executing admin review." });
  }
});

module.exports = router;