const Business = require("../models/business");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    4
);

const createBusiness = async (req, res) => {
    try {

        const {
            category,
            from,
            to,
            vehicleTypes,
            firmName,
            ownerName,
            address,
            currentCity,
            currentState,
            pincode,
            phoneNumber,
            alternatePhone,
            email,
            website,
            socialMedia,
            acceptedTerms,
            referredBy
        } = req.body;
       console.log(category);
       console.log(from);
       console.log(to);
       console.log(vehicleTypes);
       console.log(firmName);
       console.log(ownerName);
       console.log(address);
       console.log(currentCity);
       console.log(currentState);
       console.log(phoneNumber);
       console.log(email);
        // Validation
        if (
            !category ||
            !ownerName ||
            !address ||
            !currentCity ||
            !currentState ||
            !pincode ||
            !phoneNumber ||
            !email ||
            acceptedTerms !== true
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Duplicate Mobile
        const mobileExists = await Business.findOne({
            phoneNumber
        });

        if (mobileExists) {
            return res.status(400).json({
                success: false,
                message: "Phone Number already exists."
            });
        }

        // Duplicate Email
        const emailExists = await Business.findOne({
            email: email.toLowerCase()
        });

        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Business ID
        const businessId =
            "RDL" + Date.now();

        // Referral Code
        const referralCode = nanoid();

        const business = await Business.create({

            user: req.user.id,

            category,
            from,
            to,
            vehicleTypes,
            firmName,
            ownerName,
            address,
            currentCity,
            currentState,
            pincode,
            phoneNumber,
            alternatePhone,
            email: email.toLowerCase(),
            website,
            socialMedia,

            businessId,
            referralCode,
            referredBy,

            photo: req.body.photo,
            aadhaar: req.body.aadhaar,
            panCard: req.body.panCard,
            gumasta: req.body.gumasta,
            gstCertificate: req.body.gstCertificate,

            acceptedTerms

        });

        return res.status(201).json({

            success: true,
            message: "Business Registered Successfully",

            business

        });

    } 
    
// get 
    
    
    
    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,
            message: "Internal Server Error"

        });

    }
};





//get






const searchBusiness = async (req, res) => {
  try {
    const { from, to, vehicleType } = req.query;
    console.log("aarha h ");
    console.log(from);
    console.log(to);
    console.log(vehicleType);

    let query = {};

    if (from) {
      query.from = from;
    }

    if (to) {
      query.to = to;
    }

    if (vehicleType) {
      const vehicles = vehicleType.split(",");
      query.vehicleTypes = { $in: vehicles };
    }

    const businesses = await Business.find(query);

    res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createBusiness,
  searchBusiness
};