const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImagesToCloudinary } = require("../utils/imageUploader");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
require("dotenv").config();
const mailSender =  require("../utils/mailSender");

exports.createCourse = async (req, res) => {
  try {
    // Fetch data from request
    const { courseName, courseDescription, whatYouWillLearn, price, category,tag } = req.body;
    const thumbnail = req.files?.thumbnailImage;

    // Validate inputs
    if (!courseName || !courseDescription || !whatYouWillLearn || !category || !price || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    // Get instructor details
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Validate category
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadImagesToCloudinary(thumbnail, process.env.FOLDER_NAME);

    // Create course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      category: categoryDetails._id, // kept as `tag` field in Course schema
      thumbnail: uploadedImage.secure_url,
      price,
      whatYouWillLearn,
      tag
    });

    // Add course to instructor's profile
    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // Add course to category
    await Category.findByIdAndUpdate(
      categoryDetails._id,
      { $push: { course: newCourse._id } },
      { new: true }
    );

    // Response
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error while creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the course",
      error: error.message,
    });
  }
};
 
// get all courses handler fumction
exports.showAllCourses = async (req,res)=>{
    // 
    try{
        const allCourses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();
        
        return res.status(200).json({
            success:true,
            message:"data for all courses fetched succcessfully",
            data:allCourses,
        })


    }catch (error) {
        console.error("Error while fecting course data:", error);
        return res.status(500).json({
            success: false,
            message: "Error while fecting course data",
            error: error.message,
        });
    }

}

// get course details of a perticcular course 
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subsection",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with id ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.error("Error while fetching course data of one course:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching course data of one course",
      error: error.message,
    });
  }
};



// as ther is a problem with the razorpay bank account so we use a
// temperory api for  to inject users in the course. Note that it is only to be used during the production and not during
// during deployment. use only when NODE_ENV = "production"
// TEMP: Manually enroll a user in a course
exports.enrollUserInCourse = async (req, res) => {
  try {
          if (process.env.NODE_ENV === "production") {
        return res.status(403).json({
          success: false,
          message: "This route is disabled in production.",
        });
      }

    const userId = req.user.id;  // or pass in body
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Prevent duplicate enrollment
    if (course.studentsEnrolled.includes(userId)) {
      return res.status(400).json({ success: false, message: "User already enrolled" });
    }

    // Add student to course
    course.studentsEnrolled.push(userId);
    await course.save();

    // Add course to user
    await User.findByIdAndUpdate(userId, {
      $push: { courses: courseId },
    });

    // Send enrollment email (mocked)
    const emailResponse = await mailSender(
      req.user.email,
      `Successfully enrolled in ${course.courseName}`,
      courseEnrollmentEmail(course.courseName, `${req.user.firstName} ${req.user.lastName}`)
    );

    return res.status(200).json({
      success: true,
      message: "User enrolled successfully (mocked)",
      emailResponse,
    });

  } catch (error) {
    console.error("Mock enrollment error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

