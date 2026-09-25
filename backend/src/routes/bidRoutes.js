const express = require("express");



const router = express.Router();
const protect=require("../middlewhere/protectAPi");


const {



    createBid,



    getLeadBids,



    acceptBid,



    myBids,



    updateBid,



    deleteBid



} = require("../controllers/bidController");



const auth = require("../middlewhere/auth");



router.post("/create/:bookingId",protect, auth, createBid);



router.get(



    "/booking/:bookingId",


protect,
    auth,



    getLeadBids



);



router.put(



    "/accept/:bidId",


protect,

    auth,



    acceptBid



);



router.get(



    "/my-bids",


protect,
    auth,



    myBids



);



router.put(



    "/update/:bidId",

protect,

    auth,



    updateBid



);



router.delete(



    "/delete/:bidId",


protect,
    auth,



    deleteBid



);



module.exports = router;