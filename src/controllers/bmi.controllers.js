import asyncHandler from "../utils/asynchandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as bmiService from "../services/bmi.service.js";

const createBMI=asyncHandler(async(req,res)=>{
    const bmi=await bmiService.createBMI({
        userId: req.user._id,
        ...req.body,
    });

    return res.status(201).json(new ApiResponse(201,"BMI record created successfully",bmi));
});


const getBMI=asyncHandler(async(req,res)=>{
    const bmi=await bmiService.getBMI({
        userId: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200,"BMI records retrieved successfully",bmi));
});

export { createBMI, getBMI };