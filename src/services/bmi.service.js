import BMIRecord from "../models/bmirecord.models.js";
import ApiError from "../utils/ApiError.js";
import UserProfile from "../models/userprofile.models.js";
import calculateBMI from "../utils/calculateBMI.js";

const createBMI=async({userId, weight, height})=>{
    const { bmi, category } = calculateBMI(height, weight);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let record = await BMIRecord.findOne({
        user: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (record) {
        record.weight = weight;
        record.height = height;
        record.bmi = bmi;
        record.category = category;
        await record.save();
    } else {
        record = await BMIRecord.create({
            user: userId,
            height,
            weight,
            bmi,
            category
        });
    }

    const currentProfile = await UserProfile.findOne({ user: userId });
    const updatePayload = { height, weight };
    if (currentProfile && !currentProfile.startWeight) {
        updatePayload.startWeight = weight;
    } else if (!currentProfile) {
        updatePayload.startWeight = weight;
    }

    await UserProfile.findOneAndUpdate(
        {user:userId},
        updatePayload,
        {new:true, upsert:true}
    );

    return record;
};

const getBMI=async({userId})=>{
    return await BMIRecord.find({user:userId}).sort({createdAt:-1});
};

export {createBMI, getBMI};