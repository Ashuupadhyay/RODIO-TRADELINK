const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
];

const getGoogleAuth = () => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:5000/oauth/google/callback"
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return auth;
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