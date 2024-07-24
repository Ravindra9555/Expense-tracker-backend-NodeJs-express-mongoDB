// import mongoose from "mongoose";
// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true, lowercase:true },
//     password: { type: String, required: true, unique: true },
//   },
//   { timestamps: true }
// );
// export const User = mongoose.model("User", userSchema);

import mongoose, { Schema } from "mongoose";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true , index : true},
    password: { type: String, required: [true, 'password is required'], unique: true },
    refreshToken: { type: String}
  },
  { timestamps: true }
);
 userSchema.pre("save",  async function (next){
   if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next()
 })

 userSchema.methods.isPasswordMatch = async function(password){
   return  await bcrypt.compare(password, this.password);
 }

 userSchema.methods.generateAccessToken = function (){
     jwt.sign({
     _id: this._id,
     email: this.email
   },
     process.env.ACCESS_TOKEN_SECRET,
     {
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     }
   )
 };
 userSchema.methods.generateRefreshToken =function () {
   jwt.sign({
     _id: this._id,
     email: this.email
   },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     }
   )
 };
 
export const User = mongoose.model("User", userSchema);
