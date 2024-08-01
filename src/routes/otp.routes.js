import { Router } from "express";
const router = Router();
import { verifyOTP } from "../controllers/otp.controller.js";

// Verify OTP
router.route("/verify").post(verifyOTP);

export default router;