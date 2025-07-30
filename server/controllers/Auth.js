const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerficationTemplate")

// ==================== SEND OTP ====================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated:", otp);

    // Ensure unique OTP
    let result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    // Save OTP to DB
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP saved:", otpBody);

    
    try {
      await mailSender(
        email,
        "Your OTP for StudyNotion Registration",
        otpTemplate(otp)
      );
      console.log("OTP email sent");
    } catch (mailErr) {
      console.warn("Failed to send OTP email:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==================== SIGN UP ====================
exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Match passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            });
        }

        // Get most recent OTP
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("Recent OTP:", recentOtp);

        // Validate OTP
        if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is not valid",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`, 
        });

        // Respond success
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.log("Error in signup:", error);
        return res.status(500).json({
            success: false,
            message: "User registration failed",
        });
    }
};

// login
exports.login = async (req, res) => {
  try {
    // Get data from req body
    const { email, password } = req.body;

    // Validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered. Please sign up first.",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    user.token = token;
    user.password = undefined; // Hide password from response

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true, // Prevent client-side JS from accessing the cookie
    };

    // Send response with cookie
    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};


// change password
exports.changePassword = async (req, res) => {
  try {
    // 1. Get data from request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // 2. Validate inputs
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // 3. Get user from database
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 4. Compare old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 5. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update user's password in DB
    user.password = hashedPassword;
    await user.save();

    // 7. Send email notification
    try {
      await mailSender(
        user.email,
        "Password Changed Successfully",
        "Your password has been updated successfully."
      );
    } catch (mailErr) {
      console.warn("Password changed but failed to send mail:", mailErr.message);
    }

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing password",
      error:error.message,
    });
  }
};