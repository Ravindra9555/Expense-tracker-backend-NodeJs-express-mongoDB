import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";
const connectDB = async () => {
  try {
    const res = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB Connected: ${res.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default connectDB;
