const Business = require("../models/business");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");



const registerBusiness = async (req, res) => {
    try {console.log("BODY:", req.body);

        const {
            businessType,
            businessName,
            ownerName,
            address,
            phoneNumber,
            landlineNumber,
            gstNumber,
            email,
            socialMedia,
            workingArea,
            vehicleType,
            lineto,
            linefrom,
            freightCharge,
            verificationIdType
        } = req.body;
console.log({
    linefrom,
    lineto,
    vehicleType
});

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload verification document"
            });
        }
             console.log(cloudinary.config());
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "business_documents",
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        const business = await Business.create({

            businessType,
            businessName,
            ownerName,
            address,
            phoneNumber,
            landlineNumber,
            gstNumber,
            email,
            socialMedia,
            workingArea,
            vehicleType,
            lineto,
            linefrom,
            freightCharge,
            verificationIdType,

            verificationDocument: {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url
            },


        });

        return res.status(201).json({
            success: true,
            message: "Business Registered Successfully",
            business
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    registerBusiness
};