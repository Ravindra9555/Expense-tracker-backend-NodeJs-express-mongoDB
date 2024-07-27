import mongoose, { Schema } from "mongoose";
const expenseSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100,
  },
  initialAmount: { type: Number},
  expenses: [
    {
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      bill_img: { type: String }, // cloudnary url
    },
  ],
});
export const Expense = new mongoose.model("Expense", expenseSchema);
