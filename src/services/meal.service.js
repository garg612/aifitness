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

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    const item=await MealItem.find({
        mealPlan:mealId
    });

    // AI plans store meals in embedded arrays, not the MealItem collection
    if (item.length === 0) {
        const embeddedMeals = meal.weeklyPlan?.length
            ? meal.weeklyPlan
            : meal.meals?.length
                ? meal.meals
                : [];
        return { meal, item: embeddedMeals };
    }

    return { meal, item };
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


const consumeMeal = async (userId, mealId, { day, mealType } = {}) => {
    const mealPlan = await MealPlan.findOne({ _id: mealId, user: userId });
    
    if (!mealPlan) {
        throw new ApiError(404, "Meal not found");
    }

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (mealPlan.generatedByAI && day && mealType) {
        const dayPlan = mealPlan.weeklyPlan?.find(d => d.day.toLowerCase() === day.toLowerCase()) || 
                        mealPlan.meals?.find(d => d.day.toLowerCase() === day.toLowerCase());
        if (!dayPlan) {
            throw new ApiError(400, `Meal plan for day '${day}' not found`);
        }
        
        const meal = dayPlan.meals?.find(m => m.mealType.toLowerCase() === mealType.toLowerCase());
        if (!meal) {
            throw new ApiError(400, `Meal type '${mealType}' not found on ${day}`);
        }

        calories = meal.calories || 0;
        protein = meal.protein || 0;
        carbs = meal.carbs || 0;
        fat = meal.fats || 0;
    } else {
        const items = await MealItem.find({ mealPlan: mealId });
        if (items.length > 0) {
            calories = items.reduce((sum, item) => sum + ((item.calories || 0) * (parseFloat(item.quantity) || 1)), 0);
            protein = items.reduce((sum, item) => sum + ((item.protein || 0) * (parseFloat(item.quantity) || 1)), 0);
            carbs = items.reduce((sum, item) => sum + ((item.carbs || 0) * (parseFloat(item.quantity) || 1)), 0);
            fat = items.reduce((sum, item) => sum + ((item.fats || 0) * (parseFloat(item.quantity) || 1)), 0);
        } else {
            calories = mealPlan.totalCalories || 0;
        }
    }

    const log = await MealLog.create({
        user: userId,
        mealPlan: mealId,
        consumedAt: new Date(),
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFat: fat
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
