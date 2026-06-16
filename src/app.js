import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import errorHandler  from "./middlewares/error.middlewares.js";

dotenv.config();
const app=express();

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    app.use(helmet());
    app.use(cookieParser());
    app.use(morgan('common'));

    app.use(cors({
        origin:"true",
        credentials:true,

    }));

    // Importing routes
    import authRoutes from "./routes/auth.routes.js";
    import profileRoutes from "./routes/profile.routes.js";
    import bmiRoutes from "./routes/bmi.routes.js";
    // import workoutRoutes from "./routes/workout.routes.js";
    // import mealRoutes from "./routes/meal.routes.js";
    // import aiRoutes from "./routes/ai.routes.js";


    // //using routes
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/profile", profileRoutes);
    app.use("/api/v1/bmi", bmiRoutes);
    // app.use("/api/v1/workouts", workoutRoutes);
    // app.use("/api/v1/meals", mealRoutes);
    // app.use("/api/v1/ai", aiRoutes);


app.use(errorHandler);
 export  {app};