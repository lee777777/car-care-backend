exports.getNewApplicationNotificationHTML = function (data, logoUrl) {
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
    <div style="text-align: center; padding-bottom: 20px; ">
        <img src="${logoUrl}" alt="Logo" style="max-height: 60px; width: auto; font-family: 'Montserrat Alternates', sans-serif; font-weight: bold; color: #ff6500;" />
      </div>

      <div style="padding: 20px 0;">
        <h2 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 22px; margin-top: 0; font-weight: 700;">
           New Partner Application Received!
        </h2>
        <p style="font-family: '${SANS_FONT}; font-size: 15px; line-height: 1.6; color: #334155;">
          A new detailing center has submitted an onboarding registration profile. The application is securely held in the database ledger ledger staging queue <strong>awaiting administrative approval</strong>.
        </p>

        <h3 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 16px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
          Business Overview Profile
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
          <tr style="font-family: '${SANS_FONT};  background-color: #f8fafc;"><td style="padding: 10px; font-weight: 700; width: 35%; color: #1e3e62;">Company Name:</td><td style="padding: 10px; color: #0b192c;">${data.companyName}</td></tr>
          <tr style="font-family: '${SANS_FONT}; "><td style="padding: 10px; font-weight: 700; color: #1e3e62;">CR Number:</td><td style="padding: 10px; color: #0b192c;">${data.crNumber}</td></tr>
          <tr style="font-family: '${SANS_FONT}; background-color: #f8fafc;"><td style="padding: 10px; font-weight: 700; color: #1e3e62;">Store Address:</td><td style="padding: 10px; color: #0b192c;">${data.companyAddress}</td></tr>
          <tr style="font-family: '${SANS_FONT}; "><td style="padding: 10px; font-weight: 700; color: #1e3e62;">Map Coordinates:</td><td style="padding: 10px; font-family: monospace; color: #ff6500;">Lat ${Number(data.latitude).toFixed(5)}, Lng ${Number(data.longitude).toFixed(5)}</td></tr>
        </table>

        <h3 style="font-family: ${TITLE_FONT}; color: #1e3e62; font-size: 16px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
          Legal Point of Contact
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
          <tr style="font-family: '${SANS_FONT}; background-color: #f8fafc;"><td style="padding: 10px; font-weight: 700; width: 35%; color: #1e3e62;">Owner Name:</td><td style="padding: 10px; color: #0b192c;">${data.ownerName}</td></tr>
          <tr style="font-family: '${SANS_FONT};"><td style="padding: 10px; font-weight: 700; color: #1e3e62;">Phone Number:</td><td style="padding: 10px; color: #0b192c;">${data.phone}</td></tr>
          <tr style="font-family: '${SANS_FONT};  background-color: #f8fafc;"><td style="padding: 10px; font-weight: 700; color: #1e3e62;">Email Address:</td><td style="padding: 10px; color: #0b192c;">${data.email}</td></tr>
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${data.verification_document_url}" target="_blank" style="font-family:${SANS_FONT}; background-color: #ff6500; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; transition: background-color 0.2s ease;">
             Review Verification CR Document
          </a>
        </div>
      </div>

    
    </div>
  `;
};