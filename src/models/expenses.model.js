import mongoose ,{Schema} from "mongoose";
const expensesSchema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bill_img:{ type: String // cloudnry url
    }
   },
  {
    timestamps: true,
  }
);
export const Expense = mongoose.model("Expense", expensesSchema);
