const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (to, subject, html) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "RODIO",
        email: process.env.EMAIL_USER,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      htmlContent: html,
    });

    console.log("Email Sent:", response);
    return response;
  } catch (error) {
    console.error("Brevo Error:", error);
    throw error;
  }
};

module.exports = sendEmail;