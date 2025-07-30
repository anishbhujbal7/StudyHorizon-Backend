// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  showAllCourses,
  getCourseDetails,
  enrollUserInCourse,
} = require("../controllers/Course")


// Categories Controllers Import
const {
  getAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category")

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section")

// Sub-Sections Controllers Import
const {
  createSubsection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRatingForCourse,
  getAllRating,
} = require("../controllers/RatingAndReviews")



// Importing Middlewares
const { auth, isInstuctor, isStudent, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstuctor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstuctor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstuctor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstuctor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstuctor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstuctor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstuctor, createSubsection)
// Get all Registered Courses
router.get("/showAllCourses", showAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)




// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/getAllCategories", getAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.post("/getAverageRating", getAverageRating)
router.get("/getReviewsForCourse/:courseId", getAllRatingForCourse)
router.get("/getReviews", getAllRating)

// only to be used during production phase
router.post("/mockEnroll",auth,enrollUserInCourse);

module.exports = router