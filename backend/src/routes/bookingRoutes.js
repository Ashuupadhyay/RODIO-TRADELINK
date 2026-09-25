const express = require("express");
const protect=require("../middlewhere/protectAPi");
const router = express.Router();
const auth = require("../middlewhere/auth");

//router.post("/create", auth, createBooking);

//router.get("/my-bookings", auth, myBookings);

const {
createBooking,
myBookings,
getAllBookings,
myAssignedLeads,
updateLeadStatus,
updateLead,
    deleteLead,
    adminCreateBooking,
} = require("../controllers/bookingController");



router.post("/create",protect,auth,createBooking);

router.get("/my-bookings", protect,auth, myBookings);
router.get("/all", protect,getAllBookings);
router.get(
    "/assigned-leads",
    protect,
    auth,
    myAssignedLeads
);
router.put(
    "/status/:id",
    protect,
    auth,
    updateLeadStatus
);
// Edit Lead
router.patch(
    "/:id",
    auth,
    protect,
    updateLead
);

// Delete Lead
router.delete(
    "/:id",
    protect,
    auth,
    deleteLead
);
// ADMIN CREATE LOAD
router.post(
  "/admin-create",
  adminCreateBooking
);
module.exports = router;