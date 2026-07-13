const Business = require("../models/business");

exports.searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;
    console.log("from",from);
    console.log("to",to);
    console.log("vicheltuoe",vehicleType);

    let filter = {};

    // FROM
    if (from && from.trim()) {
      filter.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i"),
      };
    }

    // TO
    if (to && to.trim()) {
      filter.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i"),
      };
    }

    // MULTIPLE VEHICLE TYPES
    if (vehicleType && vehicleType.trim()) {
      const vehicles = vehicleType
        .split(",")
        .map((v) => new RegExp("^" + v.trim() + "$", "i"));

      filter.vehicleTypes = {
        $in: vehicles,
      };
    }

    console.log("Filter =>", filter);
   conlsole.log("folter",filter);
    const businesses = await Business.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};