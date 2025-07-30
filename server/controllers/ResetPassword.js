const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");


const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
  try {
    
    const email = req.body.email;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered with us",
      });
    }

    // Generate token
    const token = crypto.randomUUID();

    // Set token and expiry (fixed Date.now() usage)
    await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 minutes
      },
      { new: true }
    );

    // Create reset URL
    const url = `http://localhost:3000/update-password/${token}`;

    // Send email
    await mailSender(email, "Password Reset Link", `Password reset link: ${url}`);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully for password reset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false, 
      message: "Something went wrong",
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmedPassword, token } = req.body;

    if (password !== confirmedPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const userDetails = await User.findOne({ token });

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired, please regenerate the token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findOneAndUpdate(
      { token },
      {
        password: hashedPassword,
        token: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true }
    );

    // ✅ Send confirmation email
    await mailSender(
      updatedUser.email,
      "Password Updated",
      passwordUpdated(updatedUser.email, updatedUser.firstName || "User")
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
      error:error.message,
    });
  }
};
