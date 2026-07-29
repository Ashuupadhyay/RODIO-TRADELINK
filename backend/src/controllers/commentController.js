const Comment = require("../models/comments");
const Business = require("../models/business");



// ============================
// ADD COMMENT / RATING
// ============================

const addComment = async(req,res)=>{


try{


const {rating,comment}=req.body;



if(!rating || !comment){

return res.status(400).json({

success:false,

message:"Rating and comment required"

});

}




// Find transporter

const transporter = await Business.findById(
req.params.id
);



if(!transporter){


return res.status(404).json({

success:false,

message:"Transporter not found"

});


}






// Create Comment

const review = await Comment.create({

transporter:transporter._id,

user:req.user.id,

rating,

comment,

});







// Push comment id

if(!transporter.comments){

transporter.comments=[];

}



transporter.comments.push(
review._id
);







// Get all reviews

const reviews = await Comment.find({

transporter:transporter._id

});







// Update count

transporter.totalReviews =
reviews.length;







// Update average rating

transporter.averageRating =

reviews.length > 0

?

reviews.reduce(
(sum,item)=>sum+item.rating,
0
)
/
reviews.length

:

0;







await transporter.save();







res.status(201).json({

success:true,

message:"Review Added Successfully",

review

});





}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



};









// ============================
// GET TRANSPORTER REVIEWS
// ============================


const getTransporterComments = async(req,res)=>{


try{


const transporter = await Business.findById(
req.params.id
);



if(!transporter){


return res.status(404).json({

success:false,

message:"Transporter not found"

});


}






const comments = await Comment.find({

transporter:transporter._id

})

.populate(
"user",
"name email mobile"
)

.sort({
createdAt:-1
});







res.status(200).json({

success:true,

averageRating:
transporter.averageRating,


totalReviews:
transporter.totalReviews,


comments


});





}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



};





module.exports={

addComment,

getTransporterComments

};