const express = require('express');
const router = express.Router();



router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: applications, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
          if (error) throw error;

    res.status(200).json(applications);
  } catch (error) {
    console.error("Admin Fetch All Applications Failure:", error);
    res.status(500).json({ error: "Internal Server Error retrieving applications ledger." });
  }
});

// Route to handle PATCH requests for updating inquiry info
router.patch('/:id', async (req, res) => {
    try {
     const supabase = req.app.locals.supabase;
    const { id } = req.params; //The :id from the URL string
   const { admin_notes, status } = req.body; // Filled out by Admin in the popup modal!
    if (!["read", "resolved", "new"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'read',  'resolved' or 'new'." });
    }
 // Fetch the target inquiry 
     const { data: inquiry, error: fetchError } = await supabase
      .from('contact_inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !inquiry) {
      return res.status(404).json({ error: "Target inquiry record not found." });
    }
    // Update the inquiry's data with the provided fields in the request body
    const updatePayload = {
      admin_notes: admin_notes !== undefined ? admin_notes : inquiry.admin_notes
    };

  if (status) {
      updatePayload.status = status;
      
      // add a  timestamp if marked resolved
      if (status === "resolved") {
        updatePayload.resolved_at = new Date().toISOString();
      }
    }
      //update
    const { data: updatedRecord, error: updateError } = await supabase
      .from('contact_inquiries')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: `Inquiry ticket successfully updated to status: ${updatedRecord[0].status}`,
      data: updatedRecord[0]
    });
    
     
       } catch (error) {
    console.error("Inquiry Update Error:", error);
    res.status(500).json({ error: "Internal Server Error executing admin update of inquiry." });
  }
});
module.exports = router;