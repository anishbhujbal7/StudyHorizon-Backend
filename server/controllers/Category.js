const Category = require("../models/Category");

// Create Category handler
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create entry in DB
    const categoryDetails = await Category.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Categories handler
exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// category details
exports.categoryPageDetails = async(req,res) =>{
  try{
    //get categoryId 
    const {categoryId} = req.body;

    // get courses for specified category id
    const selectedCategory = await Category.findById(categoryId)
                                                    .populate("course")
                                                    .exec();

    // validation
    if(!selectedCategory){
      return res.status(404).json({
        success:false,
        message:"data not found",
      })
    }

    // get courses for diffrent categories
    const differentCategories = await Category.find({_id:{$ne:categoryId}})
                                                   .populate("course")
                                                   .exec();

    // get top selling courses
    // Fetch all courses, sort by studentsEnrolled.length, and take top 10
    const allCourses = await Course.find().exec();

    const topSellingCourses = allCourses
      .sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
      .slice(0, 10);

    // Final response
    return res.status(200).json({
      success: true,
      message: "Category page details fetched successfully",
      data: {
        selectedCategory,
        differentCategories,
        topSellingCourses,
      },
    });
  }catch (error) {
    console.error("Error in categoryPageDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching category page details",
      error: error.message,
    });
  }
}
