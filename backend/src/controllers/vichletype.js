exports.searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;

    let filter = {};

    if (from) {
      filter.from = {
        $regex: new RegExp("^" + from.trim() + "$", "i"),
      };
    }

    if (to) {
      filter.to = {
        $regex: new RegExp("^" + to.trim() + "$", "i"),
      };
    }

    if (vehicleType) {
      const vehicles = vehicleType
        .split(",")
        .map(v => new RegExp("^" + v.trim() + "$", "i"));

      filter.vehicleTypes = {
        $in: vehicles,
      };
    }

    const businesses = await Business.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: businesses.length,
      data: businesses,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};