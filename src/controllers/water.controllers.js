import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as waterService from "../services/water.service.js";

const logWater = asyncHandler(async (req, res) => {
  const log = await waterService.logWater({
    userId: req.user._id,
    amount: req.body.amount,
    consumedAt: req.body.consumedAt,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Water intake logged successfully", log));
});

const getDailyWaterIntake = asyncHandler(async (req, res) => {
  const date = req.query.date; // expecting string (e.g. YYYY-MM-DD) or undefined
  const data = await waterService.getDailyWaterIntake({
    userId: req.user._id,
    date,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Daily water intake retrieved successfully", data));
});

const deleteWaterLog = asyncHandler(async (req, res) => {
  const logId = req.params.id;
  await waterService.deleteWaterLog({
    userId: req.user._id,
    logId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Water log entry deleted successfully", null));
});

const updateWaterGoal = asyncHandler(async (req, res) => {
  const { waterGoal } = req.body;
  const profile = await waterService.updateWaterGoal({
    userId: req.user._id,
    waterGoal,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Water goal updated successfully", {
      waterGoal: profile.waterGoal,
    }));
});

export {
  logWater,
  getDailyWaterIntake,
  deleteWaterLog,
  updateWaterGoal,
};
