import BMIRecord from "../models/bmirecord.models.js";
import ApiError from "../utils/ApiError.js";
import UserProfile from "../models/userprofile.models.js";
import calculateBMI from "../utils/calculateBMI.js";

const createBMI=async({userId, weight, height})=>{
    const { bmi, category } = calculateBMI(height, weight);

    const record = await BMIRecord.create({
        user:userId,
        height,
        weight,
        bmi,
        category
    });

    await UserProfile.findOneAndUpdate(
        {user:userId},
        {height, weight},
        {new:true}
    );

    return record;
};

const getBMI=async({userId})=>{
    return await BMIRecord.find({user:userId}).sort({createdAt:-1});
};

export {createBMI, getBMI};