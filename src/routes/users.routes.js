 import { Router } from "express";
import { registerUser ,loginUser ,logoutUser,generateRefreshToken ,resetPassword ,forgetPasswordToken} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
 
const router = Router();

// Define routes and attach handlers
// router.post('/register', registerUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//secure routes
 router.route("/logout").post(verifyJwt,logoutUser);
 // that wh we use next in the middle ware that my work finish do onther wwork  first run verify then logout 
 // refresh  accessToken  
  router.route("/verifyAccessToken").post(generateRefreshToken);
  // forget password tokken 
  router.route("/forgetPasswordToken").post(forgetPasswordToken);
  // reset password
  router.route("/resetPassword").post(resetPassword);

 
export default router;