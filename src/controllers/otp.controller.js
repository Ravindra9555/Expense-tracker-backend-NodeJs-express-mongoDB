import { OTP } from "../models/otp.modal.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendRegistrationEmail } from "../utils/nodeMailer.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  // Check if email and OTP are provided
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }
  // Check if the provided OTP  with the otp stored in otp model
  const otpData = await OTP.findOne({ email, otp, otpType: "signup" });

  if (!otpData || otpData.expiry < new Date()) {
    throw new ApiError(401, "Invalid OTP  or expired ");
  }
  // find user by user email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  // Update the user's password and delete the OTP record
  user.isVarified = true;
  await user.save();

  // delete the otp record
  await OTP.findByIdAndDelete(otpData._id);

  try {
    await sendRegistrationEmail(user.email);
    // res.status(200).json(new ApiResponse(200, "Email sent successfully"));
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error.message}`);
    throw new ApiError(500, "Failed to send verification email");
  }

  res.status(200).json(new ApiResponse(200, "OTP verified successfully"));
  // If OTP is valid, send the email with the password reset link
});
export { verifyOTP };
