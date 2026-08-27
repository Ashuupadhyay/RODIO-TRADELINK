const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
];

const getGoogleAuth = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/oauth2callback"
  );
};

const getSheetsClient = (auth) => {
  return google.sheets({
    version: "v4",
    auth,
  });
};

module.exports = {
  getGoogleAuth,
  getSheetsClient,
  SCOPES,
};