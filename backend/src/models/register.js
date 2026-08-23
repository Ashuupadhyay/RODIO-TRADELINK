// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     role: {
// type: String,
// enum: ["user",
//     "transporter",
//     "fleet_owner",
//     "cha_agent",
//     "courier",
//     "bus_service",
//     "travel_taxi",
//     "truck_body_builder",
//     "rto_agent",
//     "finance_company",
//   "finance_agent",
// "packers_movers",
// "insurance_company",
//  "car_carrier",
//  "miningvehicle_supplier",
//  "partstypesbettry_supplier",
//  "mechanic and service center",
//  "biketexiauto",
//  "candfagent"
// ],
//   required:true,
//     },
//   /*
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//       minlength: 3,
//       maxlength: 50,
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },*/
//    mobile: {
//       type: String,
//       required: [true, "Mobile number is required"],
//       unique: true,
//       trim: true,
//       match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 4,
//     },

//     subscription: {
//   status: {
//     type: String,
//     enum: ["inactive", "active", "expired"],
//     default: "inactive",
//   },
//   plan: {
//     type: String,
//     default: "Monthly",
//   },
//   startDate: {
//     type: Date,
//     default: null,
//   },
//   endDate: {
//     type: Date,
//     default: null,
//   },
// },
// referralCode: {
//   type: String,
//   unique: true,
//   sparse: true,
    
// },

// referredBy: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "User",
//   default: null,
// },

// referralCount: {
//   type: Number,
//   default: 0,
// },

// referralEarning: {
//   type: Number,
//   default: 0,
// },
//   },
//   {
//     timestamps: true,
//   }
// );
// console.log("Allowed roles:", userSchema.path("role").enumValues);
// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
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
      ],
      required: [true, "Role is required"],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 4,
    },
    firmName: {
  type: String,
  trim: true,
  default: "",
},

    subscription: {
      status: {
        type: String,
        enum: ["inactive", "active", "expired"],
        default: "inactive",
      },
      plan: {
        type: String,
        default: "Monthly",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Unique constraint only applies when value exists
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    // models/register.js में यह फ़ील्ड ऐड करें
    
upiId: {
  type: String,
  trim: true,
  default: null,
},

    referralEarning: {
      type: Number,
      default: 0,
    },

    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);