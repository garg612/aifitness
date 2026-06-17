import {Router} from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import * as aiWorkoutController from "../controllers/aiworkout.controllers.js";

const router = Router();

router.post("/generate",verifyJWT,aiWorkoutController.generateAIWorkout);

export default router;