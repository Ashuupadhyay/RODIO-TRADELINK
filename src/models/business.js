const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({

    businessType: {
        type: String,
        required: true
    },

    businessName: {
        type: String,
        required: true
    },

    ownerName: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    landlineNumber: {
        type: String
    },

    gstNumber: {
        type: String
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    socialMedia: {
        type: String
    },

    workingArea: {
        type: String,
        required: true
    },

    vehicleType: {
        type: String,
        required: true
    },

    lineto: {
        type: String,
        required: true
    },
linefrom: {
        type: String,
        required: true
    },
    freightCharge: {
        type: Number,
        required: true
    },

    verificationIdType: {
        type: String,
        required: true
    },

   verificationDocument: {
    public_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}
}, {
    timestamps: true
});

module.exports = mongoose.model("Business", businessSchema);