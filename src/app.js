import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import errorHandler  from "./middlewares/error.middlewares.js";
import rateLimit from "express-rate-limit";
import logger from './utils/logger.js';

dotenv.config();
const app=express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again later."
    }));
    app.use(cookieParser());
    app.use(morgan('common', {
        stream: {
            write: (message) => logger.http(message.trim())
        }
    }));
    app.use(cors({
        origin: true,
        credentials: true
    }));

    app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
        next();
    });

    // Importing routes
    import authRoutes from "./routes/auth.routes.js";
    import profileRoutes from "./routes/profile.routes.js";
    import bmiRoutes from "./routes/bmi.routes.js";
    import workoutRoutes from "./routes/workout.routes.js";
    import mealRoutes from "./routes/meal.routes.js";
    import dashboardRoutes from "./routes/dashboard.routes.js";
    import aiworkoutRoutes from "./routes/aiworkout.routes.js";
    import aimealgenerateRoutes from "./routes/aimealgenerate.routes.js";


    // //using routes
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/profile", profileRoutes);
    app.use("/api/v1/bmi", bmiRoutes);
    app.use("/api/v1/workouts", workoutRoutes);
    app.use("/api/v1/meals", mealRoutes);
    app.use("/api/v1/dashboard", dashboardRoutes);
    app.use("/api/v1/ai", aiworkoutRoutes);
    app.use("/api/v1/ai", aimealgenerateRoutes);


app.use(errorHandler);
 export  {app};