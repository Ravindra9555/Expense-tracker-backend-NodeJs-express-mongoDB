import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Define the registerUser controller function
const registerUser = asyncHandler(async (req, res) => {
  // Simulate user registration logic
  const user = { username: "ravi", email: "ravi@example.com" }; // Example dummy data

  // Create a new ApiResponse instance
  const response = new ApiResponse(200, "User registered successfully", user);

  // Send the response as JSON
  res.json(response);
});

export { registerUser };
