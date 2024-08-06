import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createExpense, getExpensesOfMonth ,getinitial,getMonthlyExpensesByYear,generateDescription } from "../controllers/expense.controller.js";
const router = Router();
router.route("/createExpense").post(verifyJwt,upload.single('bill_img'),createExpense);
router.route("/expenses/monthly").get(verifyJwt,getExpensesOfMonth);
router.route("/expenses").get(verifyJwt, getMonthlyExpensesByYear);
router.route("/initialAmount").get(verifyJwt, getinitial);
// write description from ai 
router.route("/generateDescription").post(verifyJwt,generateDescription);

export default router;
