require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../.env"),
});

const {
  getGoogleAuth,
  getSheetsClient,
} = require("./googleSheetService");

const testGoogleSheet = async () => {
  try {
    console.log("================================");
    console.log("GOOGLE SHEET TEST START");
    console.log("================================");

    console.log(
      "GOOGLE_SHEET_ID:",
      process.env.GOOGLE_SHEET_ID
    );

    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error(
        "GOOGLE_SHEET_ID is missing from .env"
      );
    }

    const auth = getGoogleAuth();

    const sheets = getSheetsClient(auth);

    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    console.log("================================");
    console.log("GOOGLE SHEET CONNECTED SUCCESSFULLY");
    console.log(
      "SHEET NAME:",
      response.data.properties.title
    );
    console.log("================================");

  } catch (error) {
    console.error("================================");
    console.error("GOOGLE SHEET CONNECTION ERROR");
    console.error("================================");

    console.error(
      error.response?.data || error.message
    );
  }
};

testGoogleSheet();