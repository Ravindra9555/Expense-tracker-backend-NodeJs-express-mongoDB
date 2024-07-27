import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
 import { createExpense } from "../controllers/expense.controller.js";
const router = Router();
router.route("/createExpense").post(verifyJwt,upload.single('bill_img'),createExpense);

export default router;
