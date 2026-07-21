const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({


    // Registered User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Category (Dropdown)
    category: {
        type: String,
        required: true,
        enum: [
            "Transporter",
            "Broker",
            "Fleet Owner",
            "Truck Owner",
            "Logistics Company",
            "Warehouse",
            "Courier",
            "Packing & Moving",
            "Commission Agent",
            "RTO Agent",
            "Finance Agent",
            "Others"
        ]
    },
    to: {
  type: String,
    

    },
    from: {
  type: String,
    

    },

    // Basic Details
    firmName: {
        type: String,
    
        trim: true
    },
    // Vehicle Types
vehicleTypes: [{
    type: String,
    enum: [
        "Mini Truck",
      "Pickup",
      "Tata Ace",
      "Bolero Pickup",
      "Mahindra Jeeto",
      "Ashok Leyland Dost",
      "Tempo",
      "Canter",
      "Eicher",
      "Truck",
      "LCV",
      "HCV",
      "14 Feet Truck",
      "17 Feet Truck",
      "19 Feet Truck",
      "22 Feet Truck",
      "32 Feet Truck",
      "Open Body Truck",
      "Closed Body Truck",
      "Container",
      "Trailer",
      "Tipper",
      "Tanker",
      "Refrigerated Truck",
      "Tractor Trolley",
    ]
}],

    ownerName: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true
    },

    // Current Working Location
    currentCity: {
        type: String,
        required: true,
        index: true
    },

    currentState: {
        type: String,
        required: true,
        index: true
    },

    pincode: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    alternatePhone: {
        type: String
    },

businessId: {
    type: String,
    unique: true
},

referralCode: {
    type: String,
    unique: true
},

referredBy: {
    type: String,
    default: null
}


    ,

    email: {
        type: String,
        required: true
    },

    website: {
        type: String
    },

    socialMedia: {
        type: String
    },
    comments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
],

averageRating: {
  type: Number,
  default: 0,
},

totalReviews: {
  type: Number,
  default: 0,
},


    // Firm Photo
photo: {
  public_id: String,
  url: String
},
    // Documents
    aadhaar: {
        public_id: String,
        url: String
    },

    panCard: {
        public_id: String,
        url: String
    },

    gumasta: {
        public_id: String,
        url: String
    },

    gstCertificate: {
        public_id: String,
        url: String
    },

   
    // Verification Status
    
    // Form Checkbox
    acceptedTerms: {
        type: Boolean,
        required: true
    }

}, {
    timestamps: true
});

businessSchema.index({
    category: 1,
    currentCity: 1,
    currentState: 1
});

module.exports = mongoose.model("Business", businessSchema);