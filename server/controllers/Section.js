const Section = require("../models/Section");
const Course = require("../models/Course");
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    // validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create section
    const newSection = await Section.create({
      sectionName,
    });

    // update course with new section
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Section created and added to course successfully",
      data: updatedCourseDetails,
    });

  } catch (error) {
    console.error("Error in createSection:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating section",
      error: error.message,
    });
  }
};


exports.updateSection= async (req,res) =>{
    try{
        // data input
        const {sectionName,sectionId} = req.body;


        // data validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }


        // update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});


        // return response
        return res.status(200).json({
            success:true,
            message: "section updated successfully",
        })
    }
    catch(error){
        console.error("Error in updateSection:", error);
            return res.status(500).json({
            success: false,
            message: "Internal server error while updating section",
            error: error.message,
        }); 
    }
}


exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    // Validate
    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "sectionId and courseId are required",
      });
    }

    // Delete the section
    await Section.findByIdAndDelete(sectionId);

    // Remove the sectionId from courseContent array in Course
    await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section deleted and removed from course successfully",
    });
  } catch (error) {
    console.error("Error in deleteSection:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting section",
      error: error.message,
    });
  }
};