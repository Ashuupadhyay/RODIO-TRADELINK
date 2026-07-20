const Booking = require("../models/lead");


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

if (!["transporter", "broker"].includes(req.user.role)) {
    return res.status(403).json({
        success: false,
        message: "Only transporter or broker can access."
    });
}

    const bookings = await Booking.find()
    .populate("createdBy","name email role");

    res.json({
        success:true,
        data:bookings
    });
}


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