const express = require('express');
const router = express.Router();
// const crypto = require('crypto');

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
//only keep keys that are not undefined
const pickDefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
//admin update partner
router.patch('/:id/profile', async (req, res) => {
    try {
     const supabase = req.app.locals.supabase;
    const { id } = req.params; //The :id from the URL string
   const { company_bio, company_logo_url, company_pictures, operating_hours, is_active, info_status } = req.body;// Filled out by Admin in the popup modal!

    if (info_status !== undefined && !["incomplete", "updated"].includes(info_status)) {
      return res.status(400).json({ error: "Invalid status change. Must be 'incomplete' or 'updated'." });
    }

 

     const updateObject = pickDefined({
     company_bio,
     company_logo_url,
      company_pictures: company_pictures !== undefined 
      ? (Array.isArray(company_pictures) ? company_pictures : [company_pictures]) 
      : undefined,
      operating_hours,
      is_active,
      info_status
});
//if no filed is submitted
if (Object.keys(updateObject).length === 0) {
  return res.status(400).json({ error: "No valid fields provided for update." });
}
 

      //update
    const { data: updatedData, error: updateError } = await supabase
      .from('partner')
      .update(updateObject)
      .eq('id', id)
      .select()
      .single();
     
     
      if (updateError) {
      // Handle non-existent ID 
      if (updateError.code === 'PGRST116') {
        return res.status(404).json({ error: "Target partner record not found." });
      }
      throw updateError;
    }
    

    return res.status(200).json({
      success: true,
      message: "Partner information successfully updated.",
      data: updatedData
    });
    
     
       } catch (error) {
    console.error("Inquiry Update Error:", error);
    res.status(500).json({ error: "Internal Server Error executing admin update of partner." });
  }
});
module.exports = router;