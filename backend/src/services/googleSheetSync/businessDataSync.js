const {
  getGoogleAuth,
  getSheetsClient,
} = require("./googleSheetService");

const Business = require("../../models/business");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = "BUSINESSES";

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(" | ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join(" | ");
  }

  return String(value);
};

const ensureSheet = async (sheets) => {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const exists = spreadsheet.data.sheets?.some(
    (sheet) =>
      sheet.properties?.title === SHEET_NAME
  );

  if (exists) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,

    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: SHEET_NAME,
            },
          },
        },
      ],
    },
  });

  console.log(`Sheet created: ${SHEET_NAME}`);
};

const syncBusinesses = async () => {
  try {
    console.log("Starting Business sync...");

    const auth = getGoogleAuth();
    const sheets = getSheetsClient(auth);

    await ensureSheet(sheets);

    const businesses = await Business.find({}).lean();

    console.log(
      `Businesses found: ${businesses.length}`
    );

    const headers = [
      "BUSINESS_ID",
      "USER_ID",
      "CATEGORY",
      "FIRM_NAME",
      "BUSINESS_NAME",
      "PHONE_NUMBER",
      "ALTERNATE_PHONE_NUMBERS",
      "WHATSAPP_NUMBER",
      "EMAIL",
      "ADDRESS",
      "BRANCH_ADDRESSES",
      "LANDLINE_NUMBERS",
      "CURRENT_CITY",
      "CURRENT_STATE",
      "PINCODE",
      "WEBSITE",
      "EMPLOYEE_RANGE",
      "OFFICE_START",
      "OFFICE_END",
      "OFFICE_WORKING_DAYS",
      "REGISTRATION_STATUS",
      "SUBSCRIPTION_STATUS",
      "IS_VERIFIED",
      "VERIFIED_AT",
      "VERIFIED_BY",
      "PROFILE_UNLOCKED",
      "WORKING_AREAS",
      "IS_ACTIVE",
      "CREATED_AT",
      "UPDATED_AT",
    ];

    const rows = businesses.map((business) => [
      formatValue(business._id),
      formatValue(business.user),
      formatValue(business.category),
      formatValue(business.firmName),
      formatValue(business.name),
      formatValue(business.phoneNumber),
      formatValue(business.alternatePhoneNumbers),
      formatValue(business.whatsappNumber),
      formatValue(business.email),
      formatValue(business.address),
      formatValue(business.addresses),
      formatValue(business.landlineNumbers),
      formatValue(business.currentCity),
      formatValue(business.currentState),
      formatValue(business.pincode),
      formatValue(business.website),
      formatValue(business.employeeRange),
      formatValue(
        business.officeWorkingHours?.start
      ),
      formatValue(
        business.officeWorkingHours?.end
      ),
      formatValue(
        business.officeWorkingDays
      ),
      formatValue(
        business.registrationStatus
      ),
      formatValue(
        business.subscriptionStatus
      ),
      formatValue(
        business.isVerified
      ),
      formatValue(
        business.verifiedAt
      ),
      formatValue(
        business.verifiedBy
      ),
      formatValue(
        business.profileUnlocked
      ),
      formatValue(
        business.workingAreas
      ),
      formatValue(
        business.isActive
      ),
      formatValue(
        business.createdAt
      ),
      formatValue(
        business.updatedAt
      ),
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:AZ`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2`,
        valueInputOption: "RAW",
        requestBody: {
          values: rows,
        },
      });
    }

    console.log("================================");
    console.log("BUSINESS SYNC COMPLETED");
    console.log(
      `Rows written: ${rows.length}`
    );
    console.log("================================");

  } catch (error) {
    console.error("BUSINESS SYNC ERROR:");
    console.error(
      error.response?.data ||
      error.message
    );
  }
};

module.exports = {
  syncBusinesses,
};