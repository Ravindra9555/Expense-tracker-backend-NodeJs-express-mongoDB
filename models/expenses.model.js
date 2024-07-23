import mongoose from "mongoose";
const expensesSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    types_of_expense: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
export const Expense = mongoose.model("Expense", expensesSchema);
