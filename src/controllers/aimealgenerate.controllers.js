import { generateMealPlanService } from "../services/aimealgenerate.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAIMeal = asyncHandler(async (req, res) => {
    const mealPlan = await generateMealPlanService(req.user._id);

    return res.status(201).json(
      new ApiResponse(201, "AI meal plan generated and saved successfully.", mealPlan)
    );
});

export { generateAIMeal };