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
        enum: [
  "user",
  "transporter",
  "fleet_owner",
  "cha_agent",
  "courier",
  "bus_service",
  "travel_taxi",
  "truck_body_builder",
  "rto_agent",
  "finance_company",
  "finance_agent",
  "packers_movers",
  "insurance_company",
  "car_carrier",
  "miningvehicle_supplier",
  "partstypesbettry_supplier",
  "mechanic and service center",
  "biketexiauto",
  "candfagent",
]
    },

   name: {
  type: String,
  trim: true,
  default: "",
},
firmName: {
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