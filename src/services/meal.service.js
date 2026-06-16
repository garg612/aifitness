import MealPlan from"../models/mealPlan.models.js";
import MealItem from"../models/mealitem.models.js";
import MealLog from"../models/meallogs.models.js";
import ApiError from"../utils/ApiError.js";


const createMeal = async ({ userId, title, description, mealType, items }) => {

    const totalCalories = items.reduce((sum, item) => sum + (item.calories * parseFloat(item.quantity)), 0);

    const meal = await MealPlan.create({
        user: userId,
        title,
        description: description || "",
        mealType,
        totalCalories
    });

    if (Array.isArray(items) && items.length > 0) {
        await MealItem.insertMany(items.map(item => ({ ...item, mealPlan: meal._id })));
    }

    return meal;
};

const getMealById=async({userId,mealId})=>{
    const meal=await MealPlan.findOne({
        _id:mealId,
        user:userId
    });

    const item=await MealItem.find({
        mealPlan:mealId
    });

    return {meal,item};
};

const getAllMeals=async({userId})=>{
    return await MealPlan.find({
        user:userId
    }).sort({
        createdAt:-1
    })
};

const updateMeal=async({userId,mealId,data})=>{
    const meal=await MealPlan.findOneAndUpdate({
        _id:mealId,
        user:userId
    }, data, { new: true });

    if(!meal){
        throw new ApiError(404,"Meal not found");
    }
    return meal;
};

const deleteMeal=async({userId,mealId})=>{
    await MealPlan.findOneAndDelete({
        _id:mealId,
        user:userId
    });

    await MealItem.deleteMany({
        mealPlan:mealId
    });

}


const consumeMeal = async (userId, mealId) => {
    const mealPlan = await MealPlan.findOne({ _id: mealId, user: userId });
    
    if (!mealPlan) {
        throw new ApiError(404, "Meal not found");
    }

    const log = await MealLog.create({
        user: userId,
        mealPlan: mealId,
        consumedAt: new Date(),
        totalCalories: mealPlan.totalCalories
    });
    
    return log;
};
    
const mealhistory=async(userId)=>{
    return await MealLog.find({
        user:userId}).sort({
            consumedAt:-1
        }).populate("mealPlan");
};

export {createMeal,getMealById,getAllMeals,updateMeal,deleteMeal,consumeMeal,mealhistory};
