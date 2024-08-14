import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
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
  if (!sendConatctMail) {
    throw new ApiError(400, "Error While sending contact message");
  }
  res.status(200).json(new ApiResponse(200,"Message sent successfully", null));
  
});

 const writeDescription = asyncHandler(async(req, res)=>{
     const {name , email, subject} = req.body;
     if(!name || !email|| !subject){
        throw new ApiError(400, "Plase Fill, name , email and subject");
     }
      
     

 })  

export {contactForm}

