import mongoose from "mongoose"

const businessUserSchema = new mongoose.Schema({
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
   businessName:{
    type:String,
    required:true
   },
   website:{
    type:String,
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
    properties:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"Property"
      }
    ],
    otp: {
  code: String,
  expiresAt: Date
},
tempToken: String,
tempTokenExpires: Date,
},{timestamps:true})

export const BusinessUserModel =
  mongoose.models.BusinessUser || mongoose.model("BusinessUser", businessUserSchema);