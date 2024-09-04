import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";
const app = express();
app.use(express.static("dist"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());
app.get("/",(req, res)=>{
  res.json("API is working fine ")
});

// import routes
import usersRoutes from "./routes/users.routes.js";
import expesnseRoutes from "./routes/expense.routes.js";
import verifyOtp from "./routes/otp.routes.js";
import contact from "./routes/contact.route.js";
// apply routes
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/expenses", expesnseRoutes);
app.use("/api/v1/verifyOtp", verifyOtp);
app.use("/api/v1/contact", contact);

// Error handling middleware (must be defined after all routes)
app.use(errorHandler);

export { app };
