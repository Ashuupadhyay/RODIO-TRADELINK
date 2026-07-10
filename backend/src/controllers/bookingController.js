const Booking = require("../models/lead");


// CREATE BOOKING

exports.createBooking = async(req,res)=>{

try{

const booking = await Booking.create(req.body);


res.status(201).json({
    success:true,
    message:"Booking Created Successfully",
    data:booking
});


}
catch(error){

res.status(500).json({
    success:false,
    message:error.message
});

}

}