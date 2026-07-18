const Booking = require("../models/lead");


// CREATE BOOKING

exports.createBooking = async (req, res) => {
    try {

        console.log("req.user =", req.user);

        const booking = await Booking.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Booking Created Successfully",
            data: booking
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.myBookings = async (req, res) => {
    try {

        const bookings = await Booking.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};