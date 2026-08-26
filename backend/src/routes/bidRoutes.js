const express = require("express");

const router = express.Router();

const { createBid,getLeadBids,acceptBid,  updateBid,deleteBid } = require("../controllers/bidController");

const auth = require("../middlewhere/auth");

router.post("/create/:bookingId", auth, createBid);

router.get(
    "/booking/:bookingId",
    auth,
    getLeadBids
);
router.put(
    "/accept/:bidId",
    auth,
    acceptBid
);

router.get(
    "/my-bids",
    auth,
    myBids
);
// Transporter apni Pending bid edit kare
router.put(
    "/update/:bidId",
    auth,
    updateBid
);

// Transporter apni Pending bid delete kare
router.delete(
    "/delete/:bidId",
    auth,
    deleteBid
);
module.exports = router;