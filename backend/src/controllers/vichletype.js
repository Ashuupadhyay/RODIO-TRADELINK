const Business = require("../models/business");

exports.searchBusiness = async (req, res) => {
  try {

    let { from, to, vehicleType } = req.query;

    let filter = {
      category: "Transporter"
    };

    // Case-insensitive search
    if (from) {
      filter.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i")
      };
    }

    if (to) {
      filter.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i")
      };
    }

    // Vehicle Types Array Search
    if (vehicleType) {

      const vehicles = vehicleType
        .split(",")
        .map(v => new RegExp("^" + v.trim() + "$", "i"));

      filter.vehicleTypes = {
        $in: vehicles
      };

    }

    console.log("FILTER =", JSON.stringify(filter));

    const businesses = await Business.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};