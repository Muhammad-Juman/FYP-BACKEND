import mongoose from "mongoose"

const normalUserSchema = new mongoose.Schema({
   fullname:{
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true,
    unique:true,
   },
   phoneNumber:{
    type:Number,
    required:true,
   },
   password:{
    type:String,
    required:true
   },
   bookmark:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Property"
   }],
   recentView:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Property"
   }],
   otp: {
  code: String,
  expiresAt: Date
},
tempToken: String,
tempTokenExpires: Date,
},{timestamps:true})

export const NormalUser = mongoose.model("NormalUser",normalUserSchema)