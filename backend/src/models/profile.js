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
  trim: true,
  default: "",
},

email: {
  type: String,
  trim: true,
  lowercase: true,
  default: "",
},

phoneNumber: {
  type: String,
  default: "",
},

    profileImage: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);