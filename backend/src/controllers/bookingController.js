const Booking = require("../models/lead");

const Bid = require("../models/bid");
// CREATE BOOKING
exports.createBooking = async (req, res) => {

    const booking = await Booking.create({

        ...req.body,

        createdBy: req.user.id,

        creatorRole: req.user.role
    });

    res.status(201).json({
        success: true,
        data: booking
    });

};
exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        createdBy: req.user.id
    });

    res.json({
        success: true,
        data: bookings
    });

};
exports.getAllBookings = async (req, res) => {
    try {

        if (!["transporter", "broker"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only transporter or broker can access."
            });
        }

        // All leads - latest first
        const bookings = await Booking.find()
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 })
            .lean();

        // Har lead ka bid count nikalo
        const bookingsWithBidCount = await Promise.all(
            bookings.map(async (booking) => {

                const bidCount = await Bid.countDocuments({
                    booking: booking._id
                });

                // Available tabhi hai jab:
                // status Open ho AND bids 10 se kam ho
                const isAvailable =
                    booking.status === "Open" &&
                    bidCount < 10;

                let availabilityReason = null;

                if (booking.status !== "Open") {
                    availabilityReason = "No longer available";
                } else if (bidCount >= 10) {
                    availabilityReason = "Bid limit reached";
                }

                return {
                    ...booking,
                    bidCount,
                    isAvailable,
                    availabilityReason
                };
            })
        );

        // =====================================
        // Available leads TOP
        // Unavailable leads BOTTOM
        // Latest first inside both groups
        // =====================================
        bookingsWithBidCount.sort((a, b) => {

            // Available ko upar rakho
            if (a.isAvailable && !b.isAvailable) {
                return -1;
            }

            if (!a.isAvailable && b.isAvailable) {
                return 1;
            }

            // Same group me latest first
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json({
            success: true,
            total: bookingsWithBidCount.length,
            data: bookingsWithBidCount
        });

    } catch (error) {

        console.error("Get All Bookings Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// My Assigned Leads
// ==========================
exports.myAssignedLeads = async (req, res) => {

    try {

        const bookings = await Booking.find({

            selectedTransporter: req.user.id

        })
        .populate("createdBy", "name mobile role")
        .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            total: bookings.length,

            data: bookings

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
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

        if (
            booking.selectedTransporter.toString() !== req.user.id
        ) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });

        }

        booking.status = status;

        await booking.save();

        res.status(200).json({

            success: true,

            message: "Status Updated",

            data: booking

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};