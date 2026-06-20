
import mongoose from "mongoose";
import logger from "../utils/logger.js";


    const dbName=process.env.DB_NAME;
    const baseUrl=process.env.MONGO_URL;
    const connectdb=async()=>{
        try{ 
        await mongoose.connect(baseUrl, {
            dbName: dbName 
        });
        logger.info("Mongodb connected successfully");
        }catch(err){
            logger.error("Error connecting to mongodb: ", err);
        }
    }


export default connectdb;