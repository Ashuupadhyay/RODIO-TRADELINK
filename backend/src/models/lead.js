const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    service:{
        type:String,
        required:true
    },

    vehicleType:{
        type:String,
        required:true
    },

    pickupLocation:{
        type:String,
        required:true
    },

    loading_point:{
        type:String,
        required:true
    },

    pickupDate:{
        type:String,
        required:true
    },

    goodsType:{
        type:String
    },

    weight:{
        type:Number
    },

    contactPerson:{
        type:String,
        required:true
    },

    contactNumber:{
        type:String,
        required:true
    },

    expectedBudget:{
        type:Number
    },

    remarks:{
        type:String
    }

},
{
    timestamps:true
}
);


module.exports = mongoose.model("Booking", bookingSchema);