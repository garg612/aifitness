import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as workoutService from "../services/workout.service.js";

const createWorkout = asyncHandler(async (req, res) => {
    const workout = await workoutService.createWorkout({
        userId: req.user._id,
        ...req.body,
    });
    return res.status(201).json(new ApiResponse(201, "Workout created successfully", workout));
});

const listWorkouts = asyncHandler(async (req, res) => {
    const workouts = await workoutService.getallworkout({
        userId: req.user._id,
    });
    return res.status(200).json(new ApiResponse(200, "Workouts retrieved successfully", workouts));
});

const getWorkout = asyncHandler(async (req, res) => {
    const workout = await workoutService.getworkoutbyid({
        userId: req.user._id,
        workoutId: req.params.id,
    });
    return res.status(200).json(new ApiResponse(200, "Workout retrieved successfully", workout));
});

const updateWorkout = asyncHandler(async (req, res) => {
    const workout = await workoutService.updateworkout({
        userId: req.user._id,
        workoutId: req.params.id,
        data: req.body,
    });
    return res.status(200).json(new ApiResponse(200, "Workout updated successfully", workout));
});

const deleteWorkout = asyncHandler(async (req, res) => {
    await workoutService.deleteworkout({
        userId: req.user._id,
        workoutId: req.params.id,
    });
    return res.status(200).json(new ApiResponse(200, "Workout deleted successfully"));
});

const getworkouthistory = asyncHandler(async (req, res) => {
    const { timeframe, search, startDate, endDate } = req.query;
    const history = await workoutService.workouthistory({
        userId: req.user._id,
        timeframe,
        search,
        startDate,
        endDate
    });
    return res.status(200).json(new ApiResponse(200, "Workout history retrieved successfully", history));
});

const logWorkout = asyncHandler(async (req, res) => {
    const { duration, caloriesBurned } = req.body;
    const log = await workoutService.logWorkout({
        userId: req.user._id,
        workoutId: req.params.id,
        duration,
        caloriesBurned
    });
    return res.status(201).json(new ApiResponse(201, "Workout logged successfully", log));
});

const logCustomWorkoutController = asyncHandler(async (req, res) => {
    const log = await workoutService.logCustomWorkout({
        userId: req.user._id,
        ...req.body
    });
    return res.status(201).json(new ApiResponse(201, "Workout logged successfully", log));
});

const updateWorkoutHistoryLogController = asyncHandler(async (req, res) => {
    const log = await workoutService.updateWorkoutHistoryLog({
        userId: req.user._id,
        logId: req.params.logId,
        data: req.body
    });
    return res.status(200).json(new ApiResponse(200, "Workout log updated successfully", log));
});

const deleteWorkoutHistoryLogController = asyncHandler(async (req, res) => {
    await workoutService.deleteWorkoutHistoryLog({
        userId: req.user._id,
        logId: req.params.logId
    });
    return res.status(200).json(new ApiResponse(200, "Workout log deleted successfully"));
});

export { 
    createWorkout, 
    listWorkouts, 
    getWorkout, 
    updateWorkout, 
    deleteWorkout, 
    getworkouthistory, 
    logWorkout,
    logCustomWorkoutController,
    updateWorkoutHistoryLogController,
    deleteWorkoutHistoryLogController
};