const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: partners, error } = await supabase
      .from('partner')
      .select('*')
     .order('joined_at', { ascending: false }); // Puts newest entries at top

    if (error) throw error;

    res.status(200).json(partners);
  } catch (error) {
    console.error("Admin Fetch All Partners Failure:", error);
    res.status(500).json({ error: "Internal Server Error retrieving partners ledger." });
  }
});
//admin update partner
router.patch('/:id/profile', async (req, res) => {
    try {
     const supabase = req.app.locals.supabase;
    const { id } = req.params; //The :id from the URL string
   const { company_bio, company_logo_url, company_pictures, operating_hours, is_active, info_status } = req.body;// Filled out by Admin in the popup modal!

    if (info_status !== undefined && !["incomplete", "updated"].includes(info_status)) {
      return res.status(400).json({ error: "Invalid status change. Must be 'incomplete' or 'updated'." });
    }

 // Fetch the partner 
     const { data: partner, error: fetchError } = await supabase
      .from('partner')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return res.status(404).json({ error: "Target partner record not found." });
    }
    // Update the inquiry's data with the provided fields in the request body
    const updateObject= {};

   if (company_bio !== undefined) updateObject.company_bio = company_bio;
    
    // Save image string directly to column
    if (company_logo_url !== undefined) updateObject.company_logo_url = company_logo_url;
    
    // Save text array directly to company_pictures text[] column
    if (company_pictures !== undefined) {
      //if it's array, put it as is, if it's not an array, put it in a array.
      updateObject.company_pictures = Array.isArray(company_pictures) ? company_pictures : [company_pictures];
    }
    
    if (operating_hours !== undefined) updateObject.operating_hours = operating_hours;
    if (is_active !== undefined) updateObject.is_active = is_active;
   updateObject.info_status = info_status !== undefined ? info_status : "updated";

      //update
    const { data: updatedData, error: updateError } = await supabase
      .from('partner')
      .update(updateObject)
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: "Partner information successfully updated.",
      data: updatedData[0]
    });
    
     
       } catch (error) {
    console.error("Inquiry Update Error:", error);
    res.status(500).json({ error: "Internal Server Error executing admin update of partner." });
  }
});
module.exports = router;