import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import * as workoutService from "../services/workout.service.js";

const createWorkout=asyncHandler(async(req,res)=>{
    const workout=await workoutService.createWorkout({
        userId: req.user._id,
        ...req.body,
    });
    return res.status(201).json(new ApiResponse(201,"Workout created successfully",workout));
});

const listWorkouts=asyncHandler(async(req,res)=>{
    const workouts=await workoutService.getallworkout({
        userId:req.user._id,
    });
    return res.status(200).json(new ApiResponse(200,"Workouts retrieved successfully",workouts));
});

const getWorkout=asyncHandler(async(req,res)=>{
    const workout=await workoutService.getworkoutbyid({
        userId:req.user._id,
        workoutId:req.params.id,
    });
    return res.status(200).json(new ApiResponse(200,"Workout retrieved successfully",workout));
});

const updateWorkout=asyncHandler(async(req,res)=>{
    const workout=await workoutService.updateworkout({
        userId:req.user._id,
        workoutId:req.params.id,
        data:req.body,
    });
    return res.status(200).json(new ApiResponse(200,"Workout updated successfully",workout));
});

const deleteWorkout=asyncHandler(async(req,res)=>{
    await workoutService.deleteworkout({
        userId:req.user._id,
        workoutId:req.params.id,
    });
    return res.status(200).json(new ApiResponse(200,"Workout deleted successfully"));
});

const getworkouthistory=asyncHandler(async(req,res)=>{
    const history=await workoutService.workouthistory({
        userId:req.user._id,
    });
    return res.status(200).json(new ApiResponse(200,"Workout history retrieved successfully",history));
});

export { createWorkout, listWorkouts, getWorkout, updateWorkout, deleteWorkout, getworkouthistory };