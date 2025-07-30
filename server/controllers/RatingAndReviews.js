const RatingAndReview = require("../models/RatingsAndReviews");
const Course = require("../models/Course");
// const { response } = require("express");
const { findOne } = require("../models/Category");
const { default: mongoose } = require("mongoose");
// const RatingsAndReviews = require("../models/RatingsAndReviews");


// create rating and review
exports.createRating = async(req,res) =>{
    try{
        // get user id
        const userId = req.user.id;

        // fetch data from req body
        const {rating,review,courseId} = req.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {_id:courseId,
                studentsEnrolled:{$elemMatch:{$eq: userId}},
            }
        );
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"course not found"
            })
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"user has already reviewd the course",
            });
        }

        // create the rating and review
        const ratingAndReview = await RatingAndReview.create({
            rating,review,
            course:courseId,
            user:userId,
        });

        // update the course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingAndReview._id,
                }
            },
            {new:true},
        )
        console.log(updatedCourseDetails)

        // return response
        return res.status(200).json({
            success:true,
            message:"rating and reviews created successfully",
        })
    }catch (error) {
        console.error("Error in rating and review:", error);
        return res.status(500).json({
            success: false,
            message: "Error ",
            error: error.message,
        });
    }
}

// get average rating
exports.getAverageRating = async (req,res) =>{
    try{
        // get course id 
        const courseId = req.body.courseId;

        // calculate avg rating
        const result  = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating : {$avg:"$rating"},
                }
            }
        ])
        // return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })
        }
        return res.status(200).json({
            success:true,
            message:"no ratings till now",
            averageRating:0
        })
    }catch (error) {
        console.error("Error in rating and review:", error);
        return res.status(500).json({
            success: false,
            message: "Error ",
            error: error.message,
        });
    }
}

// get all rating and reviews for a perticular course
// Get all ratings & reviews for a specific course
exports.getAllRatingForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await RatingAndReview.find({ course: courseId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error in getAllRatingForCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching course reviews",
      error: error.message,
    });
  }
};

// Get all ratings & reviews across all courses
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .populate("user", "firstName lastName email")
      .populate("course", "courseName")
      .sort({ rating: -1 }); // optional: highest rated first

    return res.status(200).json({
      success: true,
      data: allReviews,
    });
  } catch (error) {
    console.error("Error in getAllRating:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching all reviews",
      error: error.message,
    });
  }
};
