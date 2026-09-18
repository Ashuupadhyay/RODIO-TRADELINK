// const axios = require("axios");

// const searchLocation = async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || query.length < 2) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     // OpenStreetMap Nominatim API (India Restricted)
//     const response = await axios.get(
//       "https://nominatim.openstreetmap.org/search",
//       {
//         params: {
//           q: query,
//           countrycodes: "in", // Direct India filter
//           format: "json",
//           addressdetails: 1,
//           limit: 10,
//         },
//         headers: {
//           "User-Agent": "MERN-Logistics-App", // Mandatory header for Nominatim
//         },
//       }
//     );

//     // Data Format Kar ke Response Bhejna
//     const locations = response.data.map((item) => {
//       const address = item.address;
//       const cityName =
//         address.village ||
//         address.town ||
//         address.city ||
//         address.county ||
//         address.suburb ||
//         item.display_name.split(",")[0];

//       return {
//         name: cityName,
//         fullAddress: item.display_name,
//         state: address.state || "",
//         district: address.state_district || address.county || "",
//         pincode: address.postcode || "",
//       };
//     });

//     return res.status(200).json({ success: true, data: locations });
//   } catch (error) {
//     console.error("Location Search Error:", error.message);
//     return res.status(500).json({ success: false, message: "Location fetch failed" });
//   }
// };

// module.exports = { searchLocation };
const axios = require("axios");

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const searchLocation = async (req, res) => {
  try {
    const { query, type, state } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const searchText = query.trim();

    // ==========================================
    // STATE SEARCH
    // ==========================================
    if (type === "state") {
      const matchedStates = INDIAN_STATES.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );

      return res.status(200).json({
        success: true,
        data: matchedStates.map((item) => ({
          name: item,
          state: item,
          type: "state",
        })),
      });
    }

    // ==========================================
    // CITY / TOWN / VILLAGE SEARCH
    // ==========================================
    if (type === "city") {
      if (!state) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: `${searchText}, ${state}, India`,
            countrycodes: "in",
            format: "json",
            addressdetails: 1,
            limit: 20,
            dedupe: 1,
            "accept-language": "en",
          },

          headers: {
            "User-Agent": "RodioTradeLink/1.0",
          },
        }
      );

      const locations = [];

      for (const item of response.data || []) {
        const address = item.address || {};

        const city =
          address.city ||
          address.town ||
          address.municipality ||
          address.village ||
          address.hamlet ||
          address.locality ||
          address.suburb ||
          "";

        if (!city) continue;

        // Make sure result belongs to selected state
        const resultState = address.state || "";

        if (
          resultState &&
          resultState.toLowerCase() !== state.toLowerCase()
        ) {
          continue;
        }

        locations.push({
          name: city,
          fullAddress: item.display_name,
          state: resultState || state,

          district:
            address.state_district ||
            address.district ||
            address.county ||
            "",

          pincode: address.postcode || "",

          type:
            address.city
              ? "city"
              : address.town
              ? "town"
              : address.village
              ? "village"
              : address.municipality
              ? "municipality"
              : "location",
        });
      }

      // ==========================================
      // REMOVE DUPLICATES
      // ==========================================
      const uniqueLocations = Array.from(
        new Map(
          locations.map((item) => [
            `${item.name.toLowerCase()}-${item.state.toLowerCase()}`,
            item,
          ])
        ).values()
      );

      return res.status(200).json({
        success: true,
        data: uniqueLocations,
      });
    }

    // ==========================================
    // INVALID TYPE
    // ==========================================
    return res.status(400).json({
      success: false,
      message: "Invalid search type",
    });
  } catch (error) {
    console.error(
      "Location Search Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Location fetch failed",
    });
  }
};

module.exports = {
  searchLocation,
};