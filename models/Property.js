import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
    bed:{
        type:Number,
    },
    price:{
        type:Number,
    }
})

const imageSchema = new mongoose.Schema({
    url:{
        type:String,
        required:true,
    }
})

const propertySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:["Hotel","Hostel"],
        default:"Hostel",
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    contactNumber:{
        type:Number,
        required:true,
    },
    amenities:{
        type:[String],
        required:true,
    },
    website:{
        type:String
    },
    rooms:{
        type:[roomSchema],
        required:true,
    },
    images:{
        type:[imageSchema],
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BusinessUser",
        required:true,
    }

},{timestamps:true})


export const PropertyModel = mongoose.model("Property",propertySchema)