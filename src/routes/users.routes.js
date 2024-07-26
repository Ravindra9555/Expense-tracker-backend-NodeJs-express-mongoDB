 import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
 
const router = Router();

// Define routes and attach handlers
router.post('/register', registerUser);

export default router;