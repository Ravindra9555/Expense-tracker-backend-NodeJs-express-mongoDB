import {asyncHandler }from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendConatctMail } from "../utils/nodeMailer.js";

const contactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, description } = req.body;
  if (!name || !email || !subject || !description) {
    throw new ApiError(400, "All fields are required");
  }
  const SendContactMsg = await sendConatctMail(
    name,
    email,
    subject,
    description
  );

  if (!SendContactMsg) {
    throw new ApiError(400, "Error While sending contact message");
  }

  res.status(200).json(new ApiResponse(200,"Message sent successfully", null));
  
});

 

export {contactForm}

