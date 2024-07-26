import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

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
    "User registered successfully",
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
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set secure to true in production
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", {
      user: loggedInUser,
      accessToken,
      refreshToken
    }));
});

 const logoutUser = asyncHandler(async(res, req)=>{})

export { registerUser, loginUser };
