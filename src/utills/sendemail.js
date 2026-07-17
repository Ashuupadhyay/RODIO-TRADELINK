const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "gmail",
      host: "smtp.gmail.com",
  port: 587,
  secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
});
transporter.verify((err, success) => {
    if (err) {
        console.log("SMTP Error:", err);
    } else {
        console.log("SMTP Connected");
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