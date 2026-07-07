const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"Rodio" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
 attachments: [
    {
      filename: "logo.png",
      path: "./src/assets/logo.jpeg",
      cid: "rodioLogo"
    }
  ]
      
    });
};

module.exports = sendEmail;