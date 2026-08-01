const express = require('express');
const router = express.Router();

/**
 * GET /api/admin/applications
 * Fetches all partner applications for the admin panel overview.
 */
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: applications, error } = await supabase
      .from('partner_application')
      .select('*')
      .order('created_at', { ascending: false }); // Puts pending/newest entries at top

    if (error) throw error;

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Admin Fetch All Applications Failure:", error);
    return res.status(500).json({ error: "Internal Server Error retrieving applications ledger." });
  }
});

/**
 * Partner Application Review (Approve, Decline, or Reset to Pending)
 * POST /api/admin/applications/:id/review
 */
router.post('/:id/review', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { id } = req.params; // The :id from the URL string
    const { action } = req.body; // Filled out by Admin in the popup modal!

    if (!["approve", "decline", "pending"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve', 'pending' or 'decline'." });
    }

    switch (action) {
      // Handle Rejection
      case 'decline': {
        const { data: declinedData, error: declineUpdateError } = await supabase
          .from('partner_application')
          .update({ status: 'declined', processed_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (declineUpdateError) {
          if (declineUpdateError.code === 'PGRST116') {
            return res.status(404).json({ error: "Target application record not found." });
          }
          return res.status(500).json({ error: "Failed to set status to declined." });
        }

        return res.status(200).json({
          success: true,
          message: `Application for ${declinedData.company_name} has its status updated to declined. Retained for 15-day auditing cycle.`,
          data: declinedData
        });
      }

      // Reset back to pending
      case 'pending': {
        const { data: pendingData, error: pendingUpdateError } = await supabase
          .from('partner_application')
          .update({ 
            status: 'pending', 
            processed_at: null // Resets processing stamp
          })
          .eq('id', id)
          .select()
          .single();

        if (pendingUpdateError) {
          if (pendingUpdateError.code === 'PGRST116') {
            return res.status(404).json({ error: "Target application record not found." });
          }
          return res.status(500).json({ error: "Failed to set status to pending." });
        }

        // Remove from partner table if previously approved
        const { error: deleteError } = await supabase
          .from('partner')
          .delete()
          .eq('application_id', id);
       
        if (deleteError) {
          return res.status(500).json({ error: "Failed to remove active partner record." });
        }

        return res.status(200).json({
          success: true,
          message: `Application for ${pendingData.company_name} has shifted to pending for further evaluation. Associated partner record has been deleted.`
        });
      }

      // Handle Approval
      case 'approve': {
        // 1. Update status on partner_application
        const { data: approvedData, error: approveUpdateError } = await supabase
          .from('partner_application')
          .update({ status: 'approved', processed_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (approveUpdateError) {
          if (approveUpdateError.code === 'PGRST116') {
            return res.status(404).json({ error: "Target application record not found." });
          }
          return res.status(500).json({ error: "Failed to set status to approved." });
        }

        // Upsert into partner table using approvedData properties
        const { data: partnerRecord, error: upsertPartnerError } = await supabase
          .from('partner')
          .upsert(
            [
              {
                application_id: approvedData.id,
                company_name: approvedData.company_name,
                company_address: approvedData.company_address,
                company_number: approvedData.owner_phone,
                latitude: approvedData.latitude,
                longitude: approvedData.longitude,
                company_bio: "Certified Car Care Partner Facility.",
                company_logo_url: null,
                is_active: true,
                info_status: "incomplete",
                processed_by: null
              }
            ],
            { onConflict: 'application_id' }
          )
          .select()
          .single();

        if (upsertPartnerError) {
          // Rollback status if partner record creation fails
          await supabase
            .from('partner_application')
            .update({ status: 'pending', processed_at: null })
            .eq('id', id);
      
          return res.status(500).json({ error: "Failed to create partner record, application is set to pending." });
        }

        return res.status(200).json({
          success: true,
          message: `Application for ${partnerRecord.company_name} successfully approved and migrated to the active partner table.`,
          partner: partnerRecord
        });
      }
    }
  } catch (error) {
    console.error("Partner Moderation Uncaught Error:", error);
    return res.status(500).json({ error: "Internal Server Error executing admin review." });
  } 
});

module.exports = router;