const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImagesToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();


exports.createSubsection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const video = req.files?.videoFile;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    const supportedTypes = ["mp4", "mov", "avi"];
    const fileType = video.name.split(".").pop().toLowerCase();
    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    const uploadDetails = await uploadImagesToCloudinary(video, process.env.FOLDER_NAME);

    const subSectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
      section: sectionId, 
    });

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      updatedSection,
    });
  } catch (error) {
    console.error("Error creating subsection:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImagesToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.body;

    // 1. Find the subsection to get the associated section
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const sectionId = subSection.section;

    // 2. Remove the subSection ID from the Section's subSection array
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: { subSection: subSectionId },
      },
      { new: true }
    );

    // 3. Delete the subSection document itself
    await SubSection.findByIdAndDelete(subSectionId);

    // 4. Return the updated section
    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error("Error deleting subsection:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
