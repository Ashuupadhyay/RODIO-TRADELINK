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

// Fast Performance Cache: Taaki same query baar-baar external server se mangwani na pade
const locationCache = new Map();

const searchLocation = async (req, res) => {
  try {
    const { query } = req.query;

    // Fast return if query is empty or less than 1 char
    if (!query || query.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Check in Backend Cache (Instant 0ms Response)
    if (locationCache.has(cleanQuery)) {
      return res.status(200).json({
        success: true,
        data: locationCache.get(cleanQuery),
      });
    }

    let rawResults = [];

    // 2. Check if user typed Pincode (3 to 6 digits)
    if (/^\d{3,6}$/.test(cleanQuery)) {
      const pinResponse = await axios.get(
        `https://api.postalpincode.in/pincode/${cleanQuery}`
      );
      if (pinResponse.data && pinResponse.data[0]?.Status === "Success") {
        rawResults = pinResponse.data[0].PostOffices || [];
      }
    } 
    // 3. User typed Name (Gaon, Tehsil, City, District Name)
    else {
      const nameResponse = await axios.get(
        `https://api.postalpincode.in/postoffice/${cleanQuery}`
      );
      if (nameResponse.data && nameResponse.data[0]?.Status === "Success") {
        rawResults = nameResponse.data[0].PostOffices || [];
      }
    }

    // 4. Format data EXACTLY as Frontend expects
    // (name, fullAddress, state, district, pincode)
    const formattedLocations = rawResults.slice(0, 15).map((po) => {
      const locationName = po.Name || "";
      const district = po.District || "";
      const state = po.State || "";
      const pincode = po.Pincode || "";

      return {
        name: locationName,
        fullAddress: `${locationName}, ${district}, ${state} ${pincode ? "- " + pincode : ""}`,
        state: state,
        district: district,
        pincode: pincode,
      };
    });

    // Save in Cache for future instant calls
    if (formattedLocations.length > 0) {
      locationCache.set(cleanQuery, formattedLocations);
    }

    // Return response in same structure Frontend expects
    return res.status(200).json({
      success: true,
      data: formattedLocations,
    });
  } catch (error) {
    console.error("Location Search Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Location fetch failed",
    });
  }
};

module.exports = { searchLocation };