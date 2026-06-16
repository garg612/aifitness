
import mongoose from "mongoose";


    const dbName=process.env.DB_NAME;
    const baseUrl=process.env.MONGO_URL;
    const connectdb=async()=>{
        try{ 
        await mongoose.connect(baseUrl, {
            dbName: dbName 
        });
        console.log("Mongodb connected successfully");
        }catch(err){
            console.log("Error connecting to mongodb",err);
        }
    }


export default connectdb;