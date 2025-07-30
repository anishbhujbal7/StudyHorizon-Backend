const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");

exports.updateProfile = async (req,res) =>{
    try{
        // get data
        const {dateOfBirth ="",about ="",contactNumber,gender} = req.body;


        // get uderId
        const id = req.user.id;


        // validation
        if(!contactNumber||!gender||!id){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails =await  Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.contactNumber= contactNumber;
        profileDetails.about=about;
        profileDetails.gender=gender;
        // now as we have created object so we dont have to use create or find by id and update function function to update the profile
        // those functions are only used when we do not have any objects. so now we use save function 
        await profileDetails.save();
        // Create a plain object from the Mongoose document
        const profileDataToReturn = profileDetails.toObject();
        delete profileDataToReturn.contactNumber;

        // return response 
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDataToReturn
        })
    }
    catch(error){
        console.error("Error in updateProfile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating section",
            error: error.message,
        });
    }
};




exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. Unenroll the user from all courses
    await Course.updateMany(
      { studentsEnrolled: id },
      { $pull: { studentsEnrolled: id } }
    );

    // 2. Delete the profile
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // 3. Delete the user
    await User.findByIdAndDelete(id);

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting account",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req,res)=>{
    try {
        // get id
        const id = req.user.id;

        // validate and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data:userDetails
        });
    }
    catch (error) {
        console.error("Error in getAllUserDetails:", error);
            return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }  
}



// const cron = require("node-cron");
// const User = require("../models/User");

// Run every 5 minutes
// cron.schedule("*/5 * * * *", async () => {
//   try {
//     console.log("Running scheduled user deletion job");

//     // Find users marked for deletion and past deletionDate
//     const usersToDelete = await User.find({
//       markedForDeletion: true,
//       deletionDate: { $lte: new Date() },
//     });

//     for (const user of usersToDelete) {
//       await User.findByIdAndDelete(user._id);
//       console.log(`Deleted user: ${user.email}`);
//     }
//   } catch (error) {
//     console.error("Cron job error:", error);
//   }
// });

