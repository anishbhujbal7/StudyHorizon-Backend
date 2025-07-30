const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    // Get course ID and user ID
    const { course_id } = req.body;
    const userId = req.user.id; 

    // Validation
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid course ID",
      });
    }

    // Validate course
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is already enrolled
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }

    // Create Razorpay order
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course_id,
        userId: userId,
      },
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      console.log("Payment Response:", paymentResponse);

      // Return response with order details
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
        courseDescription:course.courseDescription,
      });
    } catch (error) {
      console.error("Razorpay Error:", error);
      return res.status(500).json({
        success: false,
        message: "Could not initiate order",
      });
    }
  } catch (error) {
    console.error("Capture Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while capturing payment",
    });
  }
};



// verify signature
exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = "12345678"; // Replace with your actual webhook secret
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    // Compare signatures
    if (signature === digest) {
      console.log("Webhook signature verified.");

      // Do something with the webhook payload
      const { courseId, userId } = req.body.payload.payment.entity.notes;

      try {
        // fulfill the action

        // find course and enroll student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );

        if (!enrolledCourse) {
          return res.status(500).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log(enrolledCourse);

        // find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findOneAndUpdate(
          { _id: userId },
          { $push: { courses: courseId } },
          { new: true }
        );

        console.log(enrolledStudent);

        // send confirmation mail
        const emailResponse = await mailSender(
          enrolledStudent.email,
          "Congratulations",
          "you have been onboarded"
        );

        console.log(emailResponse);
      } catch (error) {
        console.error("Enrollment error:", error);
        return res.status(500).json({
          success: false,
          message: "Enrollment process failed",
        });
      }

    } else {
      console.warn("Invalid webhook signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};