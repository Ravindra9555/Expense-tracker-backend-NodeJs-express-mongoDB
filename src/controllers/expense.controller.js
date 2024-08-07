import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Expense } from "../models/expense.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/looger.js";
 import moment from "moment/moment.js";
 import mongoose from "mongoose";
 import { GoogleGenerativeAI } from "@google/generative-ai";

 const createExpense = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      month,
      year,
      date,
      amount,
      name,
      category,
      bill_img,
      initialAmount, // Default value to 0
    } = req.body;

    // Validate inputs
    console.log(req.body);
    if (!userId || !month || !year || !amount || !name || !category) {
      throw new ApiError(401, "All fields are required");
    }

    // Handle upload file
    const billImgPath = req.file?.path;
    let billImgUrl = null;

    if (billImgPath) {
      const uploadResult = await uploadOnCloudinary(billImgPath);
      billImgUrl = uploadResult?.url;
    }

    // Convert date to ISO format if necessary
    const formattedDate = moment(date, ["YYYY-MM-DD", "DD/MM/YYYY"]).toISOString();

    // Find or create the expense document
    let expenseDoc = await Expense.findOne({ userId, month, year });

    if (!expenseDoc) {
      // Create new expense document with initial amount
      expenseDoc = await Expense.create({
        userId,
        month,
        year,
        initialAmount,
        expenses: [],
      });
    } else {
      // Update the initial amount if provided
      if (initialAmount > 0) {
        expenseDoc.initialAmount = initialAmount;
      }

      // Check if the specific expense already exists in the array
      const expenseExists = expenseDoc.expenses.some(
        (exp) => exp.date === formattedDate && exp.name === name && exp.category === category
      );
      if (expenseExists) {
        throw new ApiError(401, "Expense with the same details already exists for this month");
      }
    }

    // Push new expense to the expenses array
    expenseDoc.expenses.push({
      date: formattedDate,
      amount,
      name,
      category,
      bill_img: billImgUrl,
    });

    // Save the updated document
    const savedExpense = await expenseDoc.save();

    res.status(201).json(new ApiResponse(200, "Expense Created Successfully", savedExpense));

  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    throw new ApiError(500, "Failed to create expense");
  }
});

// controller for generate description  
const generateDescription= asyncHandler(async(req,res)=>{
const {date,category,amount}=req.body;
 if(!date || !category || !amount){
   throw new ApiError(400, "date, category and amount are required");
 }
const GenAI=  new GoogleGenerativeAI(process.env.GENAI_TOKEN);
const modal = GenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const promt = ` Genearte one line of description for my expense here is my In Rupees ${amount} , Type is '${category}', date is '${date}' , descriptionshould not be more than one line` ; 

 const result = await modal.generateContent(promt);
 if(result.error){
   throw new ApiError(500, "Failed to generate description");
 }
 res.status(200).json(new ApiResponse(200, "Description generated successfully", result));

})
// controller to get initail  ammount of the month 
 const getinitial = asyncHandler(async(req, res)=>{
     try {
       const {userId, month, year}= req.query;
       if(!userId || !month || !year){
         throw new ApiError(400, "userId, month and year are required");
       }
       const expenseDoc= await Expense.findOne({userId, month, year});
       if(!expenseDoc){
         throw new ApiError(404, "No expense found for this month");
       }
       res.status(200). json(new ApiResponse(200, "Initial amount retrived succesfully", expenseDoc.initialAmount))                                                 
      
     } catch (error) {
        throw new ApiError(500, "faild to fetch initial amounts");
     }
 })

 const getExpensesOfMonth = asyncHandler(async(req, res)=>{
   try {
     const {userId, month ,year}= req.query;
      if(!userId || !month || !year){
        throw new ApiError(400, "userId, month and year are required");
      }
      const expenseDoc= await Expense.findOne({userId, month, year});
      if(!expenseDoc){
        throw new ApiError(404, "No expense found for this month");
      }
      res.status(200). json(new ApiResponse(200, "expsnse retrived succesfully", expenseDoc))
   } catch (error) {
     logger.error(`Error getting expenses: ${error.message}`);
     throw new ApiError(500, "Failed to get expenses");
   }
 })

 const getMonthlyExpensesByYear = asyncHandler(async (req, res, next) => {
  try {
    const { userId, year } = req.query;

    if (!userId || !year) {
      throw new ApiError(400, "userId and year are required");
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userId format");
    }

    // Convert userId to ObjectId
    const userObjectId =new mongoose.Types.ObjectId(userId);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          userId: userObjectId,
          year: parseInt(year, 10)
        }
      },
      {
        $unwind: "$expenses"
      },
      {
        $group: {
          _id: {
            month: "$month",
            year: "$year"
          },
          initialAmount: { $first: "$initialAmount" },
          totalExpenses: { $sum: "$expenses.amount" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          initialAmount: 1,
          totalExpenses: 1
        }
      },
      {
        $sort: { month: 1 }
      }
    ];

    const results = await Expense.aggregate(pipeline);

    if (!results.length) {
      return next(new ApiError(404, "No expenses found for the given year"));
    }

    res.status(200).json(new ApiResponse(200, "Expenses data retrieved successfully", results));
  } catch (error) {
    console.error(`Error retrieving expenses: ${error.message}`);
    next(new ApiError(500, "Failed to retrieve expenses data", [], error.stack));
  }
});

export { createExpense,getinitial,getExpensesOfMonth ,getMonthlyExpensesByYear,generateDescription};
