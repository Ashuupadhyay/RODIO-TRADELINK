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
updateLeadStatus,
updateLead,
    deleteLead,
    adminCreateBooking,
} = require("../controllers/bookingController");



router.post("/create",auth,createBooking);

router.get("/my-bookings", auth, myBookings);
router.get("/all", getAllBookings);
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
// Edit Lead
router.patch(
    "/:id",
    auth,
    updateLead
);

// Delete Lead
router.delete(
    "/:id",
    auth,
    deleteLead
);
// ADMIN CREATE LOAD
router.post(
  "/admin-create",
  adminCreateBooking
);
module.exports = router;