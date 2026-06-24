exports.getContactUsNotificationHTML = function (data, logoUrl) {
  return `
    <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; background-color: #ffffff; color:  #1e3e62; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@700&family=Montserrat:wght@400;500;700&display=swap');
        body, div, p, table, td, h2, h3, span {
          font-family: 'Montserrat', Helvetica, Arial, sans-serif !important;
        }
        .brand-title {
          font-family: 'Montserrat Alternates', Helvetica, Arial, sans-serif !important;
        }
      </style>
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="${logoUrl}" alt="Logo" style="max-height: 60px; width: auto;" />
      </div>

      <div style="padding: 20px 0;">
        <h2 style="font-family: 'Montserrat Alternates', Helvetica, Arial, sans-serif; color: #1e3e62; font-size: 22px; margin-top: 0; font-weight: 700;">
          New Website Message!
        </h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          A visitor has submitted a new inquiry ticket via the <strong>Contact Us</strong> form on the main web application portal.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px;">
          <p style="margin: 0 0 8px 0; color: #475569;"><strong style="color: #1e3e62;">Sender Identity:</strong> ${data.name}</p>
          <p style="margin: 0; color: #475569;"><strong style="color: #1e3e62;">Email:</strong> <a href="mailto:${data.email}" style="color: #ff6500; text-decoration: none;">${data.email}</a></p>
        </div>

        <h3 style="font-family: 'Montserrat Alternates', sans-serif; color:  #1e3e62; font-size: 15px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">
          Submitted Message Body:
        </h3>
        <div style="background-color: #fafafa; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #0b192c; white-space: pre-wrap;">${data.message}</div>
      </div>

    
    </div>
  `;
};