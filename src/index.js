// require ('dotenv') = config({path:"./env"})

import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({ path: "./env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log("server is running on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err, " mongo connection failed");
  });
