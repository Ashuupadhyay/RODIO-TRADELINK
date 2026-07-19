const Bid = require("../models/bid");
const Booking = require("../models/lead");

// ===============================
// Create Bid
// ===============================
exports.createBid = async (req, res) => {
    try {

        // Sirf transporter bid laga sakta hai
        if (req.user.role !== "transporter") {
            return res.status(403).json({
                success: false,
                message: "Only transporter can place a bid."
            });
        }

        const { bookingId } = req.params;
        const { amount, message } = req.body;

        // Lead exist karti hai ya nahi
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        // Sirf Open lead par bid lag sakti hai
        if (booking.status !== "Open") {
            return res.status(400).json({
                success: false,
                message: "This lead is no longer available."
            });
        }

        // Same transporter dubara bid na laga sake
        const alreadyBid = await Bid.findOne({
            booking: bookingId,
            transporter: req.user.id
        });

        if (alreadyBid) {
            return res.status(400).json({
                success: false,
                message: "You have already placed a bid on this lead."
            });
        }

        // Maximum 10 bids
        const totalBids = await Bid.countDocuments({
            booking: bookingId
        });

        if (totalBids >= 10) {
            return res.status(400).json({
                success: false,
                message: "Maximum 10 bids allowed."
            });
        }

        // Bid Create
        const bid = await Bid.create({
            booking: bookingId,
            transporter: req.user.id,
            amount,
            message
        });

        res.status(201).json({
            success: true,
            message: "Bid placed successfully.",
            data: bid
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};






// ===============================
// Get All Bids Of One Lead
// ===============================
exports.getLeadBids = async (req, res) => {
    try {

        const { bookingId } = req.params;

        // Lead exist karti hai ya nahi
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        // Sirf lead owner hi bids dekh sake
        if (booking.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const bids = await Bid.find({
            booking: bookingId
        })
        .populate(
            "transporter",
            "name mobile email companyName vehicleType"
        )
        .sort({ amount: 1 });

        res.status(200).json({
            success: true,
            totalBids: bids.length,
            data: bids
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



// ==========================
// Accept Bid
// ==========================
exports.acceptBid = async (req, res) => {

    try {

        const { bidId } = req.params;

        // Bid Find
        const bid = await Bid.findById(bidId);

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: "Bid not found."
            });
        }

        // Booking Find
        const booking = await Booking.findById(bid.booking);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        // Sirf Lead Owner Accept Kar Sakta Hai
        if (booking.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Lead Already Assigned?
        if (booking.status !== "Open") {
            return res.status(400).json({
                success: false,
                message: "Lead already assigned."
            });
        }

        // Booking Update
        booking.status = "Assigned";

        booking.selectedTransporter = bid.transporter;

        await booking.save();

        // Selected Bid Accepted
        bid.status = "Accepted";

        await bid.save();

        // Remaining Bids Rejected
        await Bid.updateMany(
            {
                booking: booking._id,
                _id: { $ne: bid._id }
            },
            {
                status: "Rejected"
            }
        );

        return res.status(200).json({

            success: true,

            message: "Transporter Selected Successfully"

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================
// My Bids
// ==========================
exports.myBids = async (req, res) => {

    try {

        if (req.user.role !== "transporter") {
            return res.status(403).json({
                success: false,
                message: "Only transporter can access."
            });
        }

        const bids = await Bid.find({
            transporter: req.user.id
        })
        .populate({
            path: "booking",
            populate: {
                path: "createdBy",
                select: "name mobile role"
            }
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: bids.length,
            data: bids
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};