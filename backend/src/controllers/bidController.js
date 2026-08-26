const express = require("express");

const router = express.Router();

const {
    createBid,
    getLeadBids,
    acceptBid,
    myBids,
    updateBid,
    deleteBid
} = require("../controllers/bidController");

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

router.put(
    "/update/:bidId",
    auth,
    updateBid
);

router.delete(
    "/delete/:bidId",
    auth,
    deleteBid
);

module.exports = router;