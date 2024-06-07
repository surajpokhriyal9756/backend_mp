const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  // First name field definition
  firstName: {
    type: String,
    required: [true, "Please enter your first name."],
  },
  // Last name field definition
  lastName: {
    type: String,
    required: [true, "Please enter your last name."],
  },
  // Email field definition
  email: {
    type: String,
    required: [true, "Please enter email."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email."],
  },
  // Password field definition
  password: {
    type: String,
    required: [true, "Please enter Password."],
    minlength: 8,
    select: true, // Password won't be included in query results by default
  },
  // Role field definition
  role: {
    type: String,
    enum: ["user", "admin", "approver"],
    default: "user",
  },
  // Designation field definition
  designation: {
    type: String,
    required: [true, "Please enter your designation."],
  },
  // Date of joining field definition
  dateOfJoining: {
    type: Date,
    required: [true, "Please enter your date of joining."],
  },
  // Phone Number field definition
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number."],
  },
  // Employee ID field definition
  emp_id: {
    type: String,
    required: [true, "Please enter your employee ID."],
    unique: true,
  },
  forcePasswordChange: {
    type: Boolean,
    default: false,
  },
  // Fields for password reset token
  passwordResetTokenExpires: Date,
  passwordResetToken: String,
});

// Method to generate and store password reset token
userSchema.methods.createResetPasswordToken = function () {
  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Hash the reset token using SHA-256 algorithm
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Set expiration time for the token (10 minutes from now)
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // Log the unhashed token and hashed token (for testing/debugging)
  console.log(
    "Reset Token:",
    resetToken,
    "Hashed Token:",
    this.passwordResetToken
  );

  // Return the unhashed token
  return resetToken;
};

// Middleware to hash password before saving user document
userSchema.pre("save", async function (next) {
  // Check if password is modified before hashing
  if (!this.isModified("password")) return next();
  // Hash the password using bcrypt with salt rounds (factor = 5)
  this.password = await bcrypt.hash(this.password, 5);
  next();
});

// Create User model from user schema
const User = mongoose.model("User", userSchema);

// Export User model
module.exports = User;
