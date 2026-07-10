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
    const { category, state, city } = req.query;
    console.log("aarha h");
    console.log(category);
    console.log(state);
    console.log(city);

    const filter = {};

    if (category) filter.category = category;
    if (state) filter.currentState = state;
    if (city) filter.currentCity = city;
  console.log("aarha h2222");
    console.log(category);
    console.log(state);
    console.log(city);
    const businesses = await Business.find(filter);
  console.log("aarha h55555555");
    console.log(category);
    console.log(state);
    console.log(city);
    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  console.log("aarha h sucesss");
    console.log(category);
    console.log(state);
    console.log(city);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
    createBusiness,
     searchBusiness
};