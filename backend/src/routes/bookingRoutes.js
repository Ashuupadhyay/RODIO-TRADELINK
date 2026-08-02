const express = require("express");

const router = express.Router();
const auth = require("../middlewhere/auth");

//router.post("/create", auth, createBooking);

//router.get("/my-bookings", auth, myBookings);

const {
createBooking,
myBookings,
getAllBookings,
myAssignedLeads,
updateLeadStatus
} = require("../controllers/bookingController");



router.post("/create",auth,createBooking);

router.get("/my-bookings", auth, myBookings);
router.get("/all", auth, getAllBookings);
router.get(
    "/assigned-leads",
    auth,
    myAssignedLeads
);
router.put(
    "/status/:id",
    auth,
    updateLeadStatus
);
module.exports = router;