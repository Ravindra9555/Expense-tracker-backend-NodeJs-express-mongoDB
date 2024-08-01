import mongoose, { Schema } from "mongoose";

const OtpSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  otpType: {
    type: String,
    required: true,
    enum: ["signup", "forgotpassword"],
  },
  otp: { type: String, required: true },
  expiry: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
  },
});

export const OTP = mongoose.model('OTP', OtpSchema);
