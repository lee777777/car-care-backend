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
    if (status !== undefined && !["read", "resolved", "new"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'read',  'resolved' or 'new'." });
    }
 // Fetch the target inquiry 
    //  const { data: inquiry, error: fetchError } = await supabase
    //   .from('contact_inquiries')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    // if (fetchError || !inquiry) {
    //   return res.status(404).json({ error: "Target inquiry record not found." });
    // }
    const updatePayload = {};
    // Update the inquiry's data with the provided fields in the request body
    if (admin_notes !== undefined) {
      updatePayload.admin_notes = admin_notes;
    }

 if (status !== undefined) {
      updatePayload.status = status;
     
      updatePayload.resolved_at = status === "resolved" ? new Date().toISOString() : null;
    }
    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }
      //update
    const { data: updatedRecord, error: updateError } = await supabase
      .from('contact_inquiries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

   if (updateError) {
      // Handle non-existent ID 
      if (updateError.code === 'PGRST116') {
        return res.status(404).json({ error: "Target inquiry record not found." });
      }
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry ticket successfully updated to status: ${updatedRecord.status}`,
      data: updatedRecord
    });
    
     
       } catch (error) {
    console.error("Inquiry Update Error:", error);
    res.status(500).json({ error: "Internal Server Error executing admin update of inquiry." });
  }
});
module.exports = router;