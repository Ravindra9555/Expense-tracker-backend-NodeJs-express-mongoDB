import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateToken.js";
import { sendOtpMail ,sendForgetPasswordMail} from "../utils/nodeMailer.js";
import { OTP } from "../models/otp.modal.js";

// Define the registerUser controller function
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Check if email already exists in the database
  const registeredUser = await User.findOne({ email });
  if (registeredUser) {
    throw new ApiError(400, "Email already exists"); // Throw error if email already exists
  }
  // Create a new user
  const user = await User.create({ email, password });

  // generate otp
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("Generated OTP: ", otp);

  // store otp to otp model

  await OTP.create({
    email: user.email,
    otpType: "signup",
    otp: otp,
  });

  // send mail with defined transport object
  const sendmail =await sendOtpMail(user.email, otp);

  if(!sendmail){
    throw new ApiError(500, "Unable to send OTP ! please try after  some time ! ")
  }

  // Fetch the created user excluding sensitive information
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user"); // Throw error if user creation fails
  }
  // Return a successful response with a 201 status code
  const response = new ApiResponse(
    201,
    "Verification OTP send to your email ",
    createdUser
  );

  return res.status(201).json(response);
});

//  / define  Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email");
  }

  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }
  // Check if the user's email is verified
  console.log("User verification status:", user.isVarified); // Debugging line

  if (!user.isVarified) {
    // resend otp
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP: ", otp);
    const isSend = await OTP.create({
      email: user.email,
      otpType: "signup",
      otp: otp,
    });

    if (!isSend) {
      throw new ApiError(500, "Failed to send verification email");
    }
    await sendOtpMail(user.email, otp);

    throw new ApiError(403, "Email not verified");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // Set secure to true in production
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // this req is comming from middleware  which have user
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true, // Set secure to true in production
  };
  // Clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

const generateRefreshToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }
  //  console.log(incommingRefreshToken)
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (decodedToken) {
      console.log(`${decodedToken._id} OOKJJKHRFGHRTG`);
    }
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid RefreshToken");
    }

    if (user?.refreshToken != incommingRefreshToken) {
      throw new ApiError(401, "Invalid RefreshToken Login again");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(200, "User verifed  succesfully", {
          accessToken: accessToken,
          refreshToken: newrefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, "Invalid RefreshToken");
  }
});

// reset password token  
 const forgetPasswordToken = asyncHandler(async(req, res)=>{
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  try {
     const token = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'10m'});
      user.refreshToken = token;
      await user.save();
      await sendForgetPasswordMail(email, token);
      res.json(new ApiResponse(200, "Reset password token sent to your email", null));
  } catch (error) {
     throw new ApiError(500, "Failed to send password reset email");
  }
 })

// Reset password 
 const resetPassword = asyncHandler(async(req, res)=>{
  const { password, token } = req.body;
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
  // we  have decoded user id  thts why it will decode user id  

  const user = await User.findById( decodedToken.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // check if token is valid and not expired  and user id is same as token's userId\
   if(user.refreshToken!==token){
     throw new ApiError(401, "Invalid or expired token");
   }

  try {
    //  user.password = await user.hashPassword(password);
     user.password=password;
     user.refreshToken= undefined;
     await user.save();
     res.json(new ApiResponse(200, "Password reset successfully", null));
  } catch (error) {
     throw new ApiError(500, "Failed to reset password");
  }
 })
 
 
export { registerUser, loginUser, logoutUser, generateRefreshToken , forgetPasswordToken , resetPassword};
