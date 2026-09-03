const mongoose = require("mongoose");

const {
  getGoogleAuth,
  getSheetsClient,
} = require("./googleSheetService");

const User = require("../../models/register");
const Business = require("../../models/business");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = "USERS";


// ==========================================
// OBJECT / ARRAY KO EXCEL FRIENDLY BANANA
// ==========================================

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(" | ");
  }

  if (
    typeof value === "object"
  ) {
    return Object.entries(value)
      .map(([key, val]) => {
        return `${key}: ${formatValue(val)}`;
      })
      .join(" | ");
  }

  return String(value);
};


// ==========================================
// SHEET CREATE / CHECK
// ==========================================

const ensureSheet = async (sheets) => {
  const spreadsheet =
    await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

  const exists =
    spreadsheet.data.sheets?.some(
      (sheet) =>
        sheet.properties?.title ===
        SHEET_NAME
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

  console.log(
    `Sheet created: ${SHEET_NAME}`
  );
};


// ==========================================
// USER + BUSINESS
// ==========================================

const syncUsers = async () => {
  try {
    console.log(
      "Starting User + Business sync..."
    );

    const auth = getGoogleAuth();

    const sheets = getSheetsClient(auth);

    await ensureSheet(sheets);


    // ======================================
    // USERS
    // ======================================

    const users =
      await User.find({})
        .lean();

    console.log(
      `Users found: ${users.length}`
    );


    // ======================================
    // BUSINESSES
    // ======================================

    const businesses =
      await Business.find({})
        .lean();

    console.log(
      `Businesses found: ${businesses.length}`
    );


    // ======================================
    // BUSINESS MAP
    // ======================================

    const businessMap =
      new Map();

    businesses.forEach(
      (business) => {
        if (business.user) {
          businessMap.set(
            String(business.user),
            business
          );
        }
      }
    );


    // ======================================
    // HEADER
    // ======================================

    const headers = [
      "MOBILE",
      "ROLE",
      "FIRM_NAME",
      "UPI_ID",

      "REFERRAL_CODE",
      "REFERRAL_COUNT",
      "REFERRAL_EARNING",

      "SUBSCRIPTION_STATUS",
      "SUBSCRIPTION_PLAN",
      "SUBSCRIPTION_START_DATE",
      "SUBSCRIPTION_END_DATE",

      "BUSINESS_CATEGORY",
      "BUSINESS_FIRM_NAME",
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
      "BUSINESS_SUBSCRIPTION_STATUS",

      "IS_VERIFIED",
      "VERIFIED_AT",

      "PROFILE_UNLOCKED",
      "WORKING_AREAS",

      "BUSINESS_ACTIVE",

      "USER_CREATED_AT",
      "USER_UPDATED_AT",

      "BUSINESS_CREATED_AT",
      "BUSINESS_UPDATED_AT",
    ];


    // ======================================
    // ROWS
    // ======================================

    const rows = users.map(
      (user) => {

        const business =
          businessMap.get(
            String(user._id)
          ) || {};


        return [

          // USER
          formatValue(user.mobile),
          formatValue(user.role),
          formatValue(user.firmName),
          formatValue(user.upiId),

          formatValue(
            user.referralCode
          ),

          formatValue(
            user.referralCount
          ),

          formatValue(
            user.referralEarning
          ),

          // USER SUBSCRIPTION
          formatValue(
            user.subscription?.status
          ),

          formatValue(
            user.subscription?.plan
          ),

          formatValue(
            user.subscription?.startDate
          ),

          formatValue(
            user.subscription?.endDate
          ),


          // BUSINESS
          formatValue(
            business.category
          ),

          formatValue(
            business.firmName
          ),

          formatValue(
            business.name
          ),

          formatValue(
            business.phoneNumber
          ),

          formatValue(
            business.alternatePhoneNumbers
          ),

          formatValue(
            business.whatsappNumber
          ),

          formatValue(
            business.email
          ),

          formatValue(
            business.address
          ),

          formatValue(
            business.addresses
          ),

          formatValue(
            business.landlineNumbers
          ),

          formatValue(
            business.currentCity
          ),

          formatValue(
            business.currentState
          ),

          formatValue(
            business.pincode
          ),

          formatValue(
            business.website
          ),

          formatValue(
            business.employeeRange
          ),

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
            business.profileUnlocked
          ),

          formatValue(
            business.workingAreas
          ),

          formatValue(
            business.isActive
          ),


          // TIMESTAMPS
          formatValue(
            user.createdAt
          ),

          formatValue(
            user.updatedAt
          ),

          formatValue(
            business.createdAt
          ),

          formatValue(
            business.updatedAt
          ),
        ];
      }
    );


    // ======================================
    // CLEAR OLD DATA
    // ======================================

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,

      range: `${SHEET_NAME}!A:AZ`,
    });


    // ======================================
    // WRITE HEADER
    // ======================================

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,

      range: `${SHEET_NAME}!A1`,

      valueInputOption: "RAW",

      requestBody: {
        values: [
          headers,
        ],
      },
    });


    // ======================================
    // WRITE USERS
    // ======================================

    if (rows.length > 0) {

      await sheets.spreadsheets.values.update({

        spreadsheetId: SHEET_ID,

        range:
          `${SHEET_NAME}!A2`,

        valueInputOption: "RAW",

        requestBody: {
          values: rows,
        },

      });

    }


    console.log(
      "================================"
    );

    console.log(
      "USER + BUSINESS SYNC COMPLETED"
    );

    console.log(
      `Rows written: ${rows.length}`
    );

    console.log(
      "================================"
    );

  } catch (error) {

    console.error(
      "USER SYNC ERROR:"
    );

    console.error(
      error.response?.data ||
      error.message
    );
  }
};


module.exports = {
  syncUsers,
};