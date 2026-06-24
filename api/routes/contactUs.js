const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const {getContactUsNotificationHTML} = require("../email_templats/contactUsNotification");
const resend = new Resend(process.env.RESEND_API_KEY);
const GLOBAL_LOGO_URL = "https://thumbs.dreamstime.com/b/polishing-waxing-car-logo-design-auto-detailing-service-orbital-polish-machine-vector-scratch-remove-buffing-logotype-251168071.jpg";

async function sendEmail(formData) {
const {name, email, subject, message} = formData;
 // email 
 
    // Email 1: internal admin notification of new contact quiry 
    await resend.emails.send({
      from: "System <onboarding@resend.dev>",
      to: "leen99belal@gmail.com",
      subject: `New Quiey: ${subject}`,
      html: getContactUsNotificationHTML(
        {
          name: name,
          email: email,
          subject: subject,
          message: message
        }, 
        GLOBAL_LOGO_URL
      )
    })


}
router.post('/submit', async (req, res) => {
 try {
    const supabase = req.app.locals.supabase;
     const {
      name,
      email,
      subject,
      message
    } = req.body;
 if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required core application metadata fields." });
    }
  // Insert text data payload and asset links into Supabase PostgreSQL
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert([
        {
          name,
          email,
          subject,
          message,
          
          status: 'new' // Enforces standard entry state for admin review 
        }
      ])
      .select();

    if (error) throw error;
   //send email to applicant and admin of new application
    try {
      await sendEmail(req.body);
    } catch (emailError) {
    
      console.error("email notification failure:", emailError);
    }

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