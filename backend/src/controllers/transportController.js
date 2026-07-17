const Transporter = require("../models/business");
const Profile = require("../models/profile");

const getTransporterById = async (req, res) => {
  try {

    const transporter = await Transporter.findById(req.params.id);
    console.log("transporter",transporter);

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: "Transporter not found",
      });
    }

    // Profile model se image lao
    const profile = await Profile.findOne({
      user: transporter.user,
    }).select("profileImage");

return res.status(200).json({
  success: true,
  data: {
    ...transporter.toObject(),

    profileImage: profile?.profileImage || "",
    totalVehicles: transporter.vehicleTypes?.length || 0,

    // Old + New compatibility
    phone: transporter.phoneNumber || transporter.phone || "",
    phoneNumber: transporter.phoneNumber || transporter.phone || ""
  }
});
    
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getTransporterById,
};