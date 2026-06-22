exports.getApplicantConfirmationHTML = function (data, logoUrl) {
  const SANS_FONT = "'Montserrat', Helvetica, Arial, sans-serif";
  const TITLE_FONT = "'Montserrat Alternates', Helvetica, Arial, sans-serif";
  return `
    <div style="font-family: ${SANS_FONT}; background-color: #ffffff; color: #0b192c; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@700&family=Montserrat:wght@400;500;700&display=swap');
        body, div, p, table, td, h2, h3, span {
          font-family: 'Montserrat', Helvetica, Arial, sans-serif !important;
        }
        .brand-title {
          font-family: 'Montserrat Alternates', Helvetica, Arial, sans-serif !important;
        }
      </style>
      <div style="text-align: center; padding-bottom: 20px;  ">
        <img src="${logoUrl}" alt="Logo" style="max-height: 60px; width: auto;" />
      </div>

      <div style="padding: 20px 0;">
        <h2 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 22px; margin-top: 0; font-weight: 700;">
          Application Received!
        </h2>
        <p style="font-family: ${SANS_FONT}; font-size: 15px; line-height: 1.6; color: #334155;">
          Hello <strong>${data.ownerName}</strong>,
        </p>
        <p style="font-family: ${SANS_FONT}; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for submitting your application to join our elite partner network. We have successfully recorded the onboarding documents submitted for <strong>${data.companyName}</strong>.
        </p>

        <div style="background-color: #f8fafc;  padding: 15px; margin: 25px 0; border-radius: 8px;">
          <p style="font-family: ${SANS_FONT}; margin: 0; font-size: 14px; font-weight: 700; color: #1e3e62;">
            Current Application Status: <span style="color: #ff6500;">Pending Admin Review</span>
          </p>
          <p style="font-family: ${SANS_FONT}; margin: 5px 0 0 0; font-size: 13px; color: #475569; line-height: 1.4;">
            Our team is actively verifying your commercial registration references and physical shop localization assets.
          </p>
        </div>

        <h3 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 16px; margin-top: 20px; font-weight: 700;">
          Next Steps in the Onboarding Process
        </h3>
        <p style="font-family: ${SANS_FONT};  font-size: 14px; line-height: 1.6; color: #334155;">
          To finalize your commercial placement and map activation settings, <strong>a member of our operations team will reach out directly to you via a phone call</strong> over the coming business days. We will use this brief call to confirm details about your facility features.
        </p>

        <h3 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 14px; margin-top: 25px; margin-bottom: 5px; font-weight: 700;">
          Your Registered Record Verification Reference:
        </h3>
        <ul style="font-family: ${SANS_FONT};  font-size: 13px; color: #475569; margin-top: 5px; padding-left: 20px; line-height: 1.5;">
          <li><strong>Commercial Registry ID:</strong> ${data.crNumber}</li>
          <li><strong>Primary Telephone Input:</strong> ${data.phone}</li>
          <li><strong>Registered Store Placement:</strong> ${data.companyAddress}</li>
        </ul>

        <p style="font-family: ${SANS_FONT};  font-size: 14px; margin-top: 30px; color: #334155; line-height: 1.5;">
          If you have any questions before our representative calls, please feel free to reply directly back to this notification inbox.
        </p>
        
        <p style="font-family: ${SANS_FONT};  font-size: 14px; margin-top: 25px; font-weight: 700; color: #1e3e62;">
          Best regards,<br />
          <span style="font-size: 13px; font-weight: 500; color: #64748b;">The Operations & Onboarding Team</span>
        </p>
      </div>

    
    </div>
  `;
}