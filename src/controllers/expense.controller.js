import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Expense } from "../models/expense.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/looger.js";
 import moment from "moment/moment.js";
 import mongoose from "mongoose";
const createExpense = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      month,
      year,
      initialAmount,
      date,
      amount,
      name,
      category,
      bill_img,
    } = req.body;
    // validate inputs
    if (
      !userId ||
      !month ||
      !year ||
      !initialAmount ||
      !amount ||
      !name ||
      !category
    ) {
      throw new ApiError(401, "All fields are required");
    }

    // handele uplaod file
    const billImgPath = req.file?.path;
    let billImgUrl = null;

    if (billImgPath) {
      const uplaodresult = await uploadOnCloudinary(billImgPath);
      billImgUrl = uplaodresult?.url;
    }

    // Convert date to ISO format if necessary
    const formattedDate = moment(date, ["YYYY-MM-DD", "DD/MM/YYYY"]).toISOString();

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
        expenses: [],
      });
    } else {
      // Optional: Check if the specific expense already exists in the array
      const expenseExists = expenseDoc.expenses.some(
        (exp) =>
          exp.date === date && exp.name === name && exp.category === category
      );
      if (expenseExists) {
        throw new ApiError(
          401,
          "Expense with the same details already exists for this month"
        );
      }
    }

    //   const expense = await Expense.create({userId,month,year,initialAmount,expenses:[]});
    expenseDoc.expenses.push({
      date:formattedDate,
      amount,
      name,
      category,
      bill_img: billImgUrl,
    });
  const saveexpense=  await expenseDoc.save();
    res.status(201).json(new ApiResponse(200, "Expense Craeted SuccesFully ",saveexpense));
  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    throw new ApiError(500, "Failed to create expense");
  }
});

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
    const { userId, year } = req.params;

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

export { createExpense,getExpensesOfMonth ,getMonthlyExpensesByYear};
