const express = require("express");
const authController = require("./../Controllers/authController");

// Create a router instance
const router = express.Router();

// Define routes

// Route for user signup
router.route("/signup").post(authController.signup);

// Route for user login
router.route("/login").post(authController.login);

// Route for resetting password using a token
router.route("/resetPass/:token").patch(authController.resetPass);

router.route("/forgotPass/:token").patch(authController.resetForgotPass);

// Route for initiating password reset (forgot password)
router.route("/forgotPass").post(authController.forgetPass);

// Export the router
module.exports = router;
