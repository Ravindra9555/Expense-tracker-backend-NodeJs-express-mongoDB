import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Expense } from "../models/expense.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
 import logger from "../utils/looger.js";

 const createExpense = asyncHandler(async(req, res)=>{
   try {
     console.log(req.body)
      const { userId,month, year, initialAmount, date , amount , name,category,bill_img  }= req.body;
      // validate inputs
      if(!userId ||!month ||!year ||!initialAmount ||!amount ||!name ||!category){
          throw new ApiError( 401 ,"All fields are required");
 
      }



      // handele uplaod file 
       const billImgPath =req.file?.path;
       let billImgUrl=null;
 
        if(billImgPath){
          const uplaodresult = await uploadOnCloudinary(billImgPath);
          billImgUrl=uplaodresult?.url;
        }
      // create expense
         // Check if expense for the same user, month, and year already exists
   let expenseDoc = await Expense.findOne({ userId, month, year });

   if (!expenseDoc) {
     // Create new expense document
     expenseDoc = await Expense.create({
       userId,
       month,
       year,
       initialAmount,
       expenses: []
     });
   } else {
     // Optional: Check if the specific expense already exists in the array
     const expenseExists = expenseDoc.expenses.some(exp => 
       exp.date === date && exp.name === name && exp.category === category
     );
     if (expenseExists) {
       throw new ApiError(401, "Expense with the same details already exists for this month");
     }
   }
 
    //   const expense = await Expense.create({userId,month,year,initialAmount,expenses:[]});
      expenseDoc.expenses.push({date,amount,name,category,bill_img:billImgUrl});
      await expenseDoc.save();
      res.status(201).json(new ApiResponse(200, "Expense Craeted SuccesFully "));
 
   } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    throw new ApiError(500, "Failed to create expense");

   }
 })
 export { createExpense };