import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"


dotenv.config()

mongoose.connect(process.env.mongourl).then(()=>{
    console.log("connection sucess")

})
.catch((err)=>{
    console.log(err)
})


const app=express()

app.use(
    cors({
        origin: process.env.frontend || "http://localhost:5173",
        method: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

app.listen(3000,()=>{
    console.log("Server is running")
})