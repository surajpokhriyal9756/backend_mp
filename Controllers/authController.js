const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const sendEmail = require("./../Utils/email");
const crypto = require("crypto");

// Function to generate JWT token
const signToken = (id) => {   
  return jwt.sign({ id }, process.env.secret_string, {
    expiresIn: process.env.login_expires,
  });
};
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    emp_id,
    email,
    phoneNumber,
    designation,
    dateOfJoining,
    role,
  } = req.body;

  // Check if any users exist in the database with the same email
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "User with this email already exists.",
      });
  }

  // Create a new user with the provided details
  const tempPass = generateTemporaryPassword();

  const newUser = await User.create({
    firstName,
    lastName,
    emp_id,
    email,
    phoneNumber,
    designation,
    dateOfJoining,
    role,
    // You can add additional fields as needed
    password: tempPass, // Temporary password
    forcePasswordChange: true, // Flag indicating that password change is required
  });

  const user = await User.findOne({ email: req.body.email });

  // Generate a random reset token and save it
  const resetToken = user.createResetPasswordToken();
  await user.save();

  // Construct the reset URL
  // console.log(`${req.get('host')}`);

  const resetURL = `${req.protocol}://localhost:3000/resetPass/${resetToken}`;

  // Prepare the email message
  const message = `This is your Temporary Password -> ${user.password} . Please use the following link to reset your password: ${resetURL}`;
  try {
    // Send the reset email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: message,
    });
    const token = signToken(newUser._id);

    // Return success response with authentication token
    res.status(201).json({
      status: "success",
      token,
     newUser,
    });

  } catch (err) {
    // If sending email fails, handle the error
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();
    const error = "Error sending password reset email";
    return next(error);
  }

  // Send email with temporary password to the new user
  // await sendTemporaryPasswordEmail(newUser.email, newUser.password);

  // Generate authentication token for the new user

});

exports.resetForgotPass = asyncErrorHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user with the hashed token and a valid expiration date
  const user = await User.findOne({
    passwordResetToken: token,
    // passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    // If no user found with the token, return an error
    const error = "Invalid or expired token";
    return next(error);
  }

  // Check for strong password
  const { password } = req.body;
  const isStrongPassword = checkStrongPassword(password);
  if (!isStrongPassword) {
    return res
      .status(400)
      .json({ status: "error", message: "Password is not strong enough." });
  }

  // Update user's password and clear reset token fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // Log in the user automatically by generating a new JWT token
  const loginToken = signToken(user._id);

  // Send success response with new token
  res.status(201).json({
    status: "success",
    token: loginToken,
  });
});
// Route handler for forgetting password
exports.forgetPass = asyncErrorHandler(async (req, res, next) => {
  // Find user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "User not found",
    });
  }

  // Generate a random reset token and save it
  const resetToken = user.createResetPasswordToken();
  await user.save();

  // Construct the reset URL
  // console.log(`${req.get('host')}`);

  const resetURL = `${req.protocol}://localhost:3000/forgot-pass/${resetToken}`;

  // Prepare the email message
  const message = `We have received a password reset request. Please use the following link to reset your password: \n ${resetURL}`;

  try {
    // Send the reset email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "Password reset link sent to user email",
    });
  } catch (err) {
    // If sending email fails, handle the error
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();
    const error = "Error sending password reset email";
    return next(error);
  }
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
//   console.log(password);

  // Check if email and password are provided
  if (!email || !password) {
    return next(new Error("Please provide email and password"));
  }


  // Find user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ status: 'error', message: 'User not found.' });
  }
  if (!user) {
    await User.create({ email, password, role });
    return res
      .status(201)
      .json({ status: "success", message: "New account created successfully" });
  }

  // If user doesn't exist, return error

  // Compare passwords
  bcrypt.compare(password, user.password, function (err, isMatch) {
    // console.log(password,' ',user.password);
    if (err) {
      console.error("Error comparing passwords:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
    if (!isMatch) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Wrong Password. Please try again.",
        });
    } else {
      // Check if user role is admin
      const loginToken = signToken(user._id);
      if (user.role === "admin") {
        return res
          .status(200)
          .json({
            status: "Login Successfully as Admin.",
            message: "Successfully Logged in as Admin.",
            role: "admin",
            user,
            token: loginToken
          });
      } else if (user.role === "user") {
        return res
          .status(200)
          .json({
            status: "Login Successfully as User.",
            message: "Successfully Logged in as User.",
            role: "user",
            user,
            token: loginToken,
          });
      } else if (user.role === "approver") {
        return res
          .status(200)
          .json({
            status: "Login Successfully as approver.",
            message: "Successfully Logged in as Approver.",
            role: "approver",
            user,
            token: loginToken,
          });
      } else {
        return res
          .status(403)
          .json({
            status: "error",
            message: "You are not authorized to access this resource.",
          });
      }
    }
  });
});

// Route handler for resetting password
exports.resetPass = asyncErrorHandler(async (req, res, next) => {
  // Get the token from the request parameters and hash it
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user with the hashed token and a valid expiration date
  const user = await User.findOne({
    passwordResetToken: token,
    // passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    // If no user found with the token or the token has expired, return an error
    return res
      .status(400)
      .json({ status: "error", message: "Invalid or expired token." });
  }

  // Check if the provided temporary password matches the one sent via email
  if (req.body.temporaryPassword !== user.password) {
    return res
      .status(400)
      .json({ status: "error", message: "Temporary password does not match." });
  }

  // Check if the new password meets the criteria for a strong password
  const newPassword = req.body.newPassword;
  const isStrongPassword = checkStrongPassword(newPassword);

  if (!isStrongPassword) {
    return res
      .status(400)
      .json({ status: "error", message: "Password is not strong enough." });
  }

  // Update user's password and clear reset token fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // Log in the user automatically by generating a new JWT token
  const loginToken = signToken(user._id);

  // Send success response with new token
  res.status(200).json({
    status: "success",
    token: loginToken,
  });
});

// Function to check if a password is strong
function checkStrongPassword(password) {
  // Define criteria for a strong password
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Check if the password meets all criteria
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChars
  );
}


const generateTemporaryPassword = () => {
  // Define a character pool for generating the password
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Set the length of the temporary password
  const length = 10;

  let temporaryPassword = "";
  for (let i = 0; i < length; i++) {
    // Generate a random index to select a character from the pool
    const randomIndex = Math.floor(Math.random() * characters.length);
    // Append the randomly selected character to the temporary password
    temporaryPassword += characters.charAt(randomIndex);
  }

  return temporaryPassword;
};

// Function to send temporary password to the new user via email
// const sendTemporaryPasswordEmail = async (email, password) => {
//     const message = `Your temporary password is: ${password}. Please login and change your password immediately.`;
//     await sendEmail({ email, subject: 'Temporary Password', message });
// };
