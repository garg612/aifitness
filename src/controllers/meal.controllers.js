import {createMeal,getMealById,getAllMeals,updateMeal,deleteMeal,consumeMeal,mealhistory} from "../services/meal.service.js";
import asyncHandler from "../utils/asynchandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const createMealcontroller=asyncHandler(async(req,res)=>{
    const meal=await createMeal({
        userId:req.user._id,
        ...req.body
    })
    return res.status(201).json(new ApiResponse(201,"Meal created successfully",meal));
});

const getMeal=asyncHandler(async(req,res)=>{
    const meal=await getMealById({
        userId:req.user._id,
        mealId:req.params.mealId
    })

    return res.status(200).json(new ApiResponse(200,"Meal fetched successfully",meal));
});

const listMeals=asyncHandler(async(req,res)=>{
    const meals=await getAllMeals({
        userId:req.user._id
    });

    return res.status(200).json(new ApiResponse(200,"Meals fetched successfully",meals));
});

const updateMealcontroller=asyncHandler(async(req,res)=>{
    const meal=await updateMeal({
        userId:req.user._id,
        mealId:req.params.mealId,
        data:req.body
    })

    return res.status(200).json(new ApiResponse(200,"Meal updated successfully",meal));
});

const deleteMealcontroller=asyncHandler(async(req,res)=>{
    await deleteMeal({
        userId:req.user._id,
        mealId:req.params.mealId
    })

    return res.status(200).json(new ApiResponse(200,"Meal deleted successfully"));
});

const consumeMealcontroller=asyncHandler(async(req,res)=>{
    const { day, mealType } = req.body;
    const meal=await consumeMeal(req.user._id,req.params.mealId, { day, mealType });

    return res.status(200).json(new ApiResponse(200,"Meal consumed successfully",meal));
});

const mealHistory=asyncHandler(async(req,res)=>{
    const history=await mealhistory(req.user._id);

    return res.status(200).json(new ApiResponse(200,"Meal history fetched successfully",history));
});

export {createMealcontroller,getMeal,listMeals,updateMealcontroller,deleteMealcontroller,consumeMealcontroller,mealHistory};