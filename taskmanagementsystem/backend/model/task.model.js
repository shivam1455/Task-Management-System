import mongoose, { Schema } from "mongoose";

const taskSchema=new mongoose.Schema(
    {
        title: {
            type:String,
            required:true
        },
        descriptin:{
            type:String,

        },
       
    }
)