const Route = require("../models/route");

// CREATE
exports.createRoute = async (req, res) => {
  try {
    const { from, to, vehicleTypes } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and To are required",
      });
    }

    const route = await Route.create({
      business: req.business._id,
      from,
      to,
      vehicleTypes: vehicleTypes || [],
    });

    return res.status(201).json({
      success: true,
      message: "Route added successfully",
      data: route,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET MY ROUTES
exports.getMyRoutes = async (req, res) => {
  try {
    const routes = await Route.find({
      business: req.business._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: routes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndUpdate(
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

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Route updated",
      data: route,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({
      _id: req.params.id,
      business: req.business._id,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Route deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};