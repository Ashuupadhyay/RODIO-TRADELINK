const express = require("express");

const router = express.Router();

const { createBid,getLeadBids,acceptBid,myBids } = require("../controllers/bidController");

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
module.exports = router;