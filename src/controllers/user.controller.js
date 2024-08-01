import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateToken.js";
import { sendOtpMail, sendRegistrationEmail } from "../utils/nodeMailer.js";
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

  // if (registeredUser && registeredUser.isVarified === flase) {
  //   // throw new ApiError(400, "Email already exists"); // Throw error if email already exists
  // }

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
  await sendOtpMail(user.email, otp);

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

// // Try to send the email before creating the user
// try {
//   await sendRegistrationEmail(email);
// } catch (error) {
//   console.error(`Error sending email to ${email}: ${error.message}`);
//   throw new ApiError(500, "Failed to send verification email");
// }

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
 console.log('User verification status:', user.isVerified); // Debugging line

 if (user.isVarified  === false) {
   throw new ApiError(403, "Email not verified");
 }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set secure to true in production
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
    secure: process.env.NODE_ENV === "production", // Set secure to true in production
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
export { registerUser, loginUser, logoutUser, generateRefreshToken };
