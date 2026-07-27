const Vehicle = require("../models/vehicle");

// CREATE
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleType,
      vehicleNumber,
      capacity,
      bodyType,
    } = req.body;

    if (!vehicleType || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle type and vehicle number are required",
      });
    }

    const vehicle = await Vehicle.create({
      business: req.business._id,
      vehicleType,
      vehicleNumber,
      capacity,
      bodyType,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Vehicle already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET MY VEHICLES
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      business: req.business._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: req.params.id,
        business: req.business._id,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      business: req.business._id,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};