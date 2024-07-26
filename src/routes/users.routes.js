 import { Router } from "express";
import { registerUser ,loginUser } from "../controllers/user.controller.js";
 
const router = Router();

// Define routes and attach handlers
// router.post('/register', registerUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
export default router;