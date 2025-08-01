//require('dotenv').config({path : './env'})

import { app } from './app.js';
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path :'./.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`Server is runny at port :${process.env.PORT}`)
    })
})
.catch((err)=>{
console.log("MONGODB Connection failed " , err)
})






/*
import express from "express";
const app = express()

( async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`)
       app.on('/error' , (error)=>{
        console.log('ERROR :' , error);
        throw error
       })

       app.listen(process.env.PORT , () =>{                                              1st approach to connect to database
        console.log(`App is listening on port ${process.env.PORT}`);
       })

    }catch(error){
        console.error("ERROR :" , error)
        throw err
    }
})()
    */