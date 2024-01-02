const mongoose = require("mongoose");

const userOTPVerificationSchema = new mongoose.Schema({
  userId: { type: String, ref: "portfolio" },
  email: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const userOTPVerification = new mongoose.model(
  "userOTPVerified",
  userOTPVerificationSchema
);

module.exports = userOTPVerification;
