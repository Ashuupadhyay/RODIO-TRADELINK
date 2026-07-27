const axios = require("axios");

const searchLocation = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // OpenStreetMap Nominatim API (India Restricted)
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          countrycodes: "in", // Direct India filter
          format: "json",
          addressdetails: 1,
          limit: 10,
        },
        headers: {
          "User-Agent": "MERN-Logistics-App", // Mandatory header for Nominatim
        },
      }
    );

    // Data Format Kar ke Response Bhejna
    const locations = response.data.map((item) => {
      const address = item.address;
      const cityName =
        address.village ||
        address.town ||
        address.city ||
        address.county ||
        address.suburb ||
        item.display_name.split(",")[0];

      return {
        name: cityName,
        fullAddress: item.display_name,
        state: address.state || "",
        district: address.state_district || address.county || "",
        pincode: address.postcode || "",
      };
    });

    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error("Location Search Error:", error.message);
    return res.status(500).json({ success: false, message: "Location fetch failed" });
  }
};

module.exports = { searchLocation };