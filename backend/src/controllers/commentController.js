// const Comment = require("../models/comments");
// const Business = require("../models/business");



// // ============================
// // ADD COMMENT / RATING
// // ============================

// const addComment = async(req,res)=>{


// try{


// const {rating,comment}=req.body;



// if(!rating || !comment){

// return res.status(400).json({

// success:false,

// message:"Rating and comment required"

// });

// }




// // Find transporter

// const transporter = await Business.findById(
// req.params.id
// );



// if(!transporter){


// return res.status(404).json({

// success:false,

// message:"Transporter not found"

// });


// }






// // Create Comment

// const review = await Comment.create({

// transporter:transporter._id,

// user:req.user.id,

// rating,

// comment,

// });







// // Push comment id

// if(!transporter.comments){

// transporter.comments=[];

// }



// transporter.comments.push(
// review._id
// );







// // Get all reviews

// const reviews = await Comment.find({

// transporter:transporter._id

// });







// // Update count

// transporter.totalReviews =
// reviews.length;







// // Update average rating

// transporter.averageRating =

// reviews.length > 0

// ?

// reviews.reduce(
// (sum,item)=>sum+item.rating,
// 0
// )
// /
// reviews.length

// :

// 0;







// await transporter.save();







// res.status(201).json({

// success:true,

// message:"Review Added Successfully",

// review

// });





// }

// catch(error){


// res.status(500).json({

// success:false,

// message:error.message

// });


// }



// };









// // ============================
// // GET TRANSPORTER REVIEWS
// // ============================


// const getTransporterComments = async(req,res)=>{


// try{


// const transporter = await Business.findById(
// req.params.id
// );



// if(!transporter){


// return res.status(404).json({

// success:false,

// message:"Transporter not found"

// });


// }






// const comments = await Comment.find({

// transporter:transporter._id

// })

// .populate(
// "user",
// "name email mobile"
// )

// .sort({
// createdAt:-1
// });







// res.status(200).json({

// success:true,

// averageRating:
// transporter.averageRating,


// totalReviews:
// transporter.totalReviews,


// comments


// });





// }

// catch(error){


// res.status(500).json({

// success:false,

// message:error.message

// });


// }



// };





// module.exports={

// addComment,

// getTransporterComments

// };
const Comment = require("../models/comments");
const Business = require("../models/business");

// ============================
// ADD COMMENT / RATING
// ============================
const addComment = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Rating aur comment required check
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating and comment required"
            });
        }

        // Rating limit check (1 se 5 ke beech)
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Target Service Provider / Business Profile Find Karein
        const provider = await Business.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Service provider / Business profile not found"
            });
        }

        // Rule Check: Service provider khud ke card / profile par review nahi de sakta
        if (provider.user && provider.user.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot review your own profile"
            });
        }

        // Create Comment / Review
        const review = await Comment.create({
            transporter: provider._id, // References Business / Provider Profile ID
            user: req.user.id,
            rating: Number(rating),
            comment
        });

        // Provider profile ke comments array mein ID push karein
        if (!provider.comments) {
            provider.comments = [];
        }
        provider.comments.push(review._id);

        // Target Provider ke sabhi reviews nikalein
        const reviews = await Comment.find({
            transporter: provider._id
        });

        // Update Total Reviews Count
        provider.totalReviews = reviews.length;

        // Update Average Rating
        provider.averageRating =
            reviews.length > 0
                ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
                : 0;

        await provider.save();

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: review
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ============================
// GET PROVIDER REVIEWS
// ============================
const getTransporterComments = async (req, res) => {
    try {
        const provider = await Business.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Service provider / Business profile not found"
            });
        }

        const comments = await Comment.find({
            transporter: provider._id
        })
        .populate("user", "name email mobile role")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            averageRating: provider.averageRating || 0,
            totalReviews: provider.totalReviews || 0,
            data: comments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "We couldn't process your request at the moment. Please try again later. If the problem continues, contact our support team."
        });
    }
};


module.exports = {
    addComment,
    getTransporterComments
};