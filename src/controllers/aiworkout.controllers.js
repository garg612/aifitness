import { generateWorkoutPlanService } from "../services/aiworkout.service.js";
import asyncHandler from "../utils/asyncHandler.js";


const generateAIWorkout = asyncHandler(async (req, res) => {
  const workout = await generateWorkoutPlanService(req.user._id);

    return res.status(201).json({
      message: "AI workout plan generated and saved successfully.",
      workout,
    });
});

export { generateAIWorkout };