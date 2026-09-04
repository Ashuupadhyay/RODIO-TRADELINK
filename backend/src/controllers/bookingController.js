// // const Booking = require("../models/lead");

// // const Bid = require("../models/bid");
// // // CREATE BOOKING
// // exports.createBooking = async (req, res) => {

// //     const booking = await Booking.create({

// //         ...req.body,

// //         createdBy: req.user.id,

// //         creatorRole: req.user.role
// //     });

// //     res.status(201).json({
// //         success: true,
// //         data: booking
// //     });

// // };
// // exports.myBookings = async (req, res) => {

// //     const bookings = await Booking.find({
// //         createdBy: req.user.id
// //     });

// //     res.json({
// //         success: true,
// //         data: bookings
// //     });

// // };
// // exports.getAllBookings = async (req, res) => {
// //     try {

// //         if (!["transporter", "broker"].includes(req.user.role)) {
// //             return res.status(403).json({
// //                 success: false,
// //                 message: "Only transporter or broker can access."
// //             });
// //         }

// //         // All leads - latest first
// //         const bookings = await Booking.find()
// //             .populate("createdBy", "name email role")
// //             .sort({ createdAt: -1 })
// //             .lean();

// //         // Har lead ka bid count nikalo
// //         const bookingsWithBidCount = await Promise.all(
// //             bookings.map(async (booking) => {

// //                 const bidCount = await Bid.countDocuments({
// //                     booking: booking._id
// //                 });

// //                 // Available tabhi hai jab:
// //                 // status Open ho AND bids 10 se kam ho
// //                 const isAvailable =
// //                     booking.status === "Open" &&
// //                     bidCount < 10;

// //                 let availabilityReason = null;

// //                 if (booking.status !== "Open") {
// //                     availabilityReason = "No longer available";
// //                 } else if (bidCount >= 10) {
// //                     availabilityReason = "Bid limit reached";
// //                 }

// //                 return {
// //                     ...booking,
// //                     bidCount,
// //                     isAvailable,
// //                     availabilityReason
// //                 };
// //             })
// //         );

// //         // =====================================
// //         // Available leads TOP
// //         // Unavailable leads BOTTOM
// //         // Latest first inside both groups
// //         // =====================================
// //         bookingsWithBidCount.sort((a, b) => {

// //             // Available ko upar rakho
// //             if (a.isAvailable && !b.isAvailable) {
// //                 return -1;
// //             }

// //             if (!a.isAvailable && b.isAvailable) {
// //                 return 1;
// //             }

// //             // Same group me latest first
// //             return new Date(b.createdAt) - new Date(a.createdAt);
// //         });

// //         res.status(200).json({
// //             success: true,
// //             total: bookingsWithBidCount.length,
// //             data: bookingsWithBidCount
// //         });

// //     } catch (error) {

// //         console.error("Get All Bookings Error:", error);

// //         res.status(500).json({
// //             success: false,
// //             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
// //         });
// //     }
// // };


// // // ==========================
// // // My Assigned Leads
// // // ==========================
// // exports.myAssignedLeads = async (req, res) => {

// //     try {

// //         const bookings = await Booking.find({

// //             selectedTransporter: req.user.id

// //         })
// //         .populate("createdBy", "name mobile role")
// //         .sort({ createdAt: -1 });

// //         res.status(200).json({

// //             success: true,

// //             total: bookings.length,

// //             data: bookings

// //         });

// //     } catch (error) {

// //         res.status(500).json({

// //             success: false,

// //             message:"We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."

// //         });

// //     }

// // };
// // exports.updateLeadStatus = async (req, res) => {

// //     try {

// //         const { status } = req.body;

// //         const booking = await Booking.findById(req.params.id);

// //         if (!booking) {

// //             return res.status(404).json({
// //                 success: false,
// //                 message: "Lead not found"
// //             });

// //         }

// //         if (
// //             booking.selectedTransporter.toString() !== req.user.id
// //         ) {

// //             return res.status(403).json({
// //                 success: false,
// //                 message: "Unauthorized"
// //             });

// //         }

// //         booking.status = status;

// //         await booking.save();

// //         res.status(200).json({

// //             success: true,

// //             message: "Status Updated",

// //             data: booking

// //         });

// //     } catch (error) {

// //         res.status(500).json({

// //             success: false,

// //             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."

// //         });

// //     }

// // };
// const Booking = require("../models/lead");
// const Bid = require("../models/bid");

// // ===============================
// // Create Booking / Lead
// // ===============================
// exports.createBooking = async (req, res) => {
//     try {
//         const booking = await Booking.create({
//             ...req.body,
//             createdBy: req.user.id,
//             creatorRole: req.user.role
//         });

//         return res.status(201).json({
//             success: true,
//             data: booking
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//         });
//     }
// };

// // ===============================
// // My Bookings / Created Leads
// // ===============================
// exports.myBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find({
//             createdBy: req.user.id
//         }).sort({ createdAt: -1 });

//         return res.json({
//             success: true,
//             total: bookings.length,
//             data: bookings
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//         });
//     }
// };

// // ===============================
// // Get All Bookings (Marketplace Leads)
// exports.getAllBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find()
//             .populate("createdBy", "name email role")
//             .sort({ createdAt: -1 })
//             .lean();

//         const bookingsWithBidCount = await Promise.all(
//             bookings.map(async (booking) => {
//                 // Bid count check karein
//                 const bidCount = await Bid.countDocuments({
//                     booking: booking._id
//                 });

//                 // Status agar Open hai AUR bid limit (10) se kam hai, tabhi available hai
//                 const isAvailable = booking.status === "Open" && bidCount < 10;

//                 let availabilityReason = null;
//                 let displayStatus = "ACTIVE";

//                 if (booking.status === "Assigned") {
//                     displayStatus = "ACCEPTED";
//                     availabilityReason = "Lead Accepted";
//                 } else if (bidCount >= 10) {
//                     displayStatus = "LIMIT_REACHED";
//                     availabilityReason = "Bid limit reached";
//                 } else if (booking.status !== "Open") {
//                     displayStatus = "INACTIVE";
//                     availabilityReason = "No longer available";
//                 }

//                 return {
//                     ...booking,
//                     bidCount,
//                     isAvailable,
//                     availabilityReason,
//                     displayStatus
//                 };
//             })
//         );

//         // Active leads sabse upar, baaki niche
//         bookingsWithBidCount.sort((a, b) => {
//             if (a.isAvailable && !b.isAvailable) return -1;
//             if (!a.isAvailable && b.isAvailable) return 1;
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//         return res.status(200).json({
//             success: true,
//             total: bookingsWithBidCount.length,
//             data: bookingsWithBidCount
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });
//     }
// };

// // ==========================
// // My Assigned Leads
// // ==========================
// exports.myAssignedLeads = async (req, res) => {
//     try {
//         // "user" ko skip karke baaki sabhi assigned service providers dekh sakein
//         if (req.user.role === "user") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Users cannot access assigned leads section."
//             });
//         }

//         const bookings = await Booking.find({
//             selectedTransporter: req.user.id
//         })
//         .populate("createdBy", "name mobile role")
//         .sort({ createdAt: -1 });

//         return res.status(200).json({
//             success: true,
//             total: bookings.length,
//             data: bookings
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//         });
//     }
// };

// // ==========================
// // Update Lead Status
// // ==========================
// exports.updateLeadStatus = async (req, res) => {
//     try {
//         const { status } = req.body;

//         const booking = await Booking.findById(req.params.id);

//         if (!booking) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Lead not found"
//             });
//         }

//         // Check if selected assigned service provider is updating status
//         if (!booking.selectedTransporter || booking.selectedTransporter.toString() !== req.user.id) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized to update status for this lead."
//             });
//         }

//         booking.status = status;
//         await booking.save();

//         return res.status(200).json({
//             success: true,
//             message: "Status Updated",
//             data: booking
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
//         });
//     }
// };



const Booking = require("../models/lead");
const Bid = require("../models/bid");
const mongoose = require("mongoose");
// ===============================
// Create Booking / Lead
// ===============================
exports.createBooking = async (req, res) => {
    try {
        const booking = await Booking.create({
            ...req.body,
            status: req.body.status || "Open", // <-- Ensure status defaults to "Open"
            createdBy: req.user.id,
            creatorRole: req.user.role
        });

        return res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error("Create Booking Error:", error);
        return res.status(500).json({
            success: false,
            message: "We couldn't process your request at the moment."
        });
    }
};

// ===============================
// My Bookings / Created Leads
// ===============================
exports.myBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            createdBy: req.user.id
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            total: bookings.length,
            data: bookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// ==========================
// Edit Lead - Single / Multiple Fields
// ==========================
exports.updateLead = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or you are not authorized to edit this lead."
            });
        }

        // Sirf allowed fields hi update hongi
        const allowedFields = [
            "service",
            "vehicleType",
            "pickupLocation",
            "loading_point",
            "pickupDate",
            "goodsType",
            "weight",
            "contactPerson",
            "contactNumber",
            "expectedBudget",
            "remarks"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update."
            });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user.id
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Lead updated successfully.",
            data: updatedBooking
        });

    } catch (error) {
        console.error("UPDATE LEAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update the lead. Please check the information and try again."
        });
    }
};
// ==========================
// Delete Lead
// ==========================
exports.deleteLead = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or you are not authorized to delete this lead."
            });
        }

        await Booking.deleteOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        return res.status(200).json({
            success: true,
            message: "Lead deleted successfully."
        });

    } catch (error) {
        console.error("DELETE LEAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete the lead. Please try again."
        });
    }
};








// ===============================
// Get All Bookings (Marketplace Leads)
// ===============================
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 })
            .lean();

        const bookingsWithBidCount = await Promise.all(
            bookings.map(async (booking) => {
                // Total Bids Count
                const bidCount = await Bid.countDocuments({
                    booking: booking._id
                });

                // Status Check ("Open" ya "Pending" dono ko Active mano)
                const isOpen = booking.status === "Open" || booking.status === "Pending";

                // Lead ACTIVE tabhi hogi jab Open ho AUR bids 10 se KAM (0 to 9) hon
                const isAvailable = isOpen && bidCount < 10;

                let availabilityReason = null;
                let displayStatus = "ACTIVE";

                if (booking.status === "Assigned" || booking.status === "Accepted") {
                    displayStatus = "ACCEPTED";
                    availabilityReason = "Lead Accepted";
                } else if (bidCount >= 10) {
                    displayStatus = "LIMIT_REACHED";
                    availabilityReason = "Bid limit reached (10/10)";
                } else if (!isOpen) {
                    displayStatus = "INACTIVE";
                    availabilityReason = "No longer available";
                }

                return {
                    ...booking,
                    status: isOpen ? "Open" : booking.status,
                    bidCount,
                    isAvailable,
                    availabilityReason,
                    displayStatus
                };
            })
        );

        // Active leads ko TOP par rakhein, baki ko Niche
        bookingsWithBidCount.sort((a, b) => {
            if (a.isAvailable && !b.isAvailable) return -1;
            if (!a.isAvailable && b.isAvailable) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return res.status(200).json({
            success: true,
            total: bookingsWithBidCount.length,
            data: bookingsWithBidCount
        });

    } catch (error) {
        console.error("Get All Bookings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// My Assigned Leads
// ==========================
exports.myAssignedLeads = async (req, res) => {
    try {
        if (req.user.role === "user") {
            return res.status(403).json({
                success: false,
                message: "Users cannot access assigned leads section."
            });
        }

        const bookings = await Booking.find({
            selectedTransporter: req.user.id
        })
        .populate("createdBy", "name mobile role")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: bookings.length,
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// Update Lead Status
// ==========================
exports.updateLeadStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        if (!booking.selectedTransporter || booking.selectedTransporter.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update status for this lead."
            });
        }

        booking.status = status;
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Status Updated",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// ==========================================
// ADMIN CREATE LOAD
// Existing createBooking ko touch nahi karta
// ==========================================

exports.adminCreateBooking = async (req, res) => {
  try {
    const {
      createdBy,
      creatorRole,
      service,
      vehicleType,
      pickupLocation,
      loading_point,
      pickupDate,
      goodsType,
      weight,
      contactPerson,
      contactNumber,
      expectedBudget,
      remarks,
      status,
    } = req.body || {};

    // USER OBJECT ID
    if (
      !createdBy ||
      !mongoose.Types.ObjectId.isValid(createdBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid User Object ID is required",
      });
    }

    // USER EXIST KARTA HAI YA NAHI
    const user = await mongoose
      .model("User")
      .findById(createdBy)
      .select("_id name email mobile role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // CREATE LOAD
    const booking = await Booking.create({
      createdBy: user._id,

      creatorRole:
        creatorRole || user.role,

      status: status || "Open",

      service,
      vehicleType,
      pickupLocation,
      loading_point,
      pickupDate,

      goodsType: goodsType || "",
      weight: weight || "",

      contactPerson,
      contactNumber,

      expectedBudget:
        expectedBudget !== "" &&
        expectedBudget !== undefined
          ? Number(expectedBudget)
          : undefined,

      remarks: remarks || "",
    });

    return res.status(201).json({
      success: true,
      message: "Load created successfully",
      data: booking,
      user,
    });

  } catch (error) {
    console.error(
      "Admin Create Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create load",
      error: error.message,
    });
  }
};