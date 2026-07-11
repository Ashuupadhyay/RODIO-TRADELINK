const Contact = require("../models/queryform");
const { google } = require("googleapis");
const path = require("path");
const SPREADSHEET_ID = "1vwTPxl78UMNAMSrW-XbNW952-opX80r71KGsJs1YQtI";
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../rodio-502117-1bbcd3156097.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// Create Contact
const createContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validation
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message,
    });
await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: "Sheet1!A:E",
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [
      [
        name,
        phone,
        email,
        subject,
        message,
      ],
    ],
  },
});
    return res.status(201).json({
      success: true,
      message: "Query submitted successfully.Our team replay soon",
      data: contact,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createContact,
};