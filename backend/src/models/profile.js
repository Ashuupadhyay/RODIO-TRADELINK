const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    role: {
        type: String,
        required: true,
        enum: ["user", "transporter", "broker"]
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);