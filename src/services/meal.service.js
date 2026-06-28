import MealPlan from "../models/mealPlan.models.js";
import MealItem from "../models/mealitem.models.js";
import MealLog from "../models/meallogs.models.js";
import ApiError from "../utils/ApiError.js";

const normalizeMealType = (type) => {
  if (!type || typeof type !== "string") return "lunch";
  const normalized = type.toLowerCase().trim();
  if (["breakfast", "lunch", "dinner", "snack"].includes(normalized)) {
    return normalized;
  }
  return "lunch"; // Default fallback if not matched in enum
};

const getDateFilter = (timeframe, startDate, endDate) => {
  const start = new Date();
  const end = new Date();
  
  if (timeframe === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { $gte: start, $lte: end };
  }
  
  if (timeframe === "this_week") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { $gte: sevenDaysAgo, $lte: end };
  }
  
  if (timeframe === "this_month") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { $gte: thirtyDaysAgo, $lte: end };
  }
  
  if (timeframe === "custom" && startDate && endDate) {
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    return { $gte: s, $lte: e };
  }
  
  return null;
};

const createMeal = async ({ userId, title, description, mealType, items }) => {
    const totalCalories = items.reduce((sum, item) => sum + ((item.calories || 0) * (Number(item.quantity) || 1)), 0);

    const meal = await MealPlan.create({
        user: userId,
        title,
        description: description || "",
        mealType: mealType ? mealType.toLowerCase() : "lunch",
        totalCalories,
        items: items || [],
    });

    if (Array.isArray(items) && items.length > 0) {
        await MealItem.insertMany(items.map(item => ({ ...item, mealPlan: meal._id })));
    }

    return meal;
};

const getMealById = async ({ userId, mealId }) => {
    const meal = await MealPlan.findOne({
        _id: mealId,
        user: userId
    });

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    let item = meal.items;
    if (!item || item.length === 0) {
        item = await MealItem.find({ mealPlan: mealId });
    }

    // AI plans store meals in embedded arrays
    if ((!item || item.length === 0) && (meal.weeklyPlan?.length || meal.meals?.length)) {
        const embeddedMeals = meal.weeklyPlan?.length
            ? meal.weeklyPlan
            : meal.meals?.length
                ? meal.meals
                : [];
        return { meal, item: embeddedMeals };
    }

    return { meal, item };
};

const getAllMeals = async ({ userId }) => {
    const meals = await MealPlan.find({
        user: userId
    }).sort({
        createdAt: -1
    }).lean();

    for (let meal of meals) {
        if (!meal.generatedByAI) {
            const items = meal.items && meal.items.length > 0
                ? meal.items
                : await MealItem.find({ mealPlan: meal._id });
            meal.protein = items.reduce((sum, i) => sum + ((i.protein || 0) * (Number(i.quantity) || 1)), 0);
            meal.carbs = items.reduce((sum, i) => sum + ((i.carbs || 0) * (Number(i.quantity) || 1)), 0);
            meal.fats = items.reduce((sum, i) => sum + ((i.fats || i.fat || 0) * (Number(i.quantity) || 1)), 0);
        } else {
            let protein = 0, carbs = 0, fats = 0;
            const dayMeals = meal.weeklyPlan?.[0]?.meals || meal.meals?.[0]?.meals || [];
            for (let dm of dayMeals) {
                protein += dm.protein || 0;
                carbs += dm.carbs || 0;
                fats += dm.fats || dm.fat || 0;
            }
            meal.protein = protein;
            meal.carbs = carbs;
            meal.fats = fats;
        }
    }

    return meals;
};

const updateMeal = async ({ userId, mealId, data }) => {
    if (data.items) {
        data.totalCalories = data.items.reduce((sum, item) => sum + ((item.calories || 0) * (Number(item.quantity) || 1)), 0);
    }

    const meal = await MealPlan.findOneAndUpdate({
        _id: mealId,
        user: userId
    }, data, { new: true });

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    if (data.items) {
        await MealItem.deleteMany({ mealPlan: mealId });
        await MealItem.insertMany(data.items.map(item => ({ ...item, mealPlan: mealId })));
    }

    return meal;
};

const deleteMeal = async ({ userId, mealId }) => {
    await MealPlan.findOneAndDelete({
        _id: mealId,
        user: userId
    });

    await MealItem.deleteMany({
        mealPlan: mealId
    });
};

const consumeMeal = async (userId, mealId, { day, mealType } = {}) => {
    const mealPlan = await MealPlan.findOne({ _id: mealId, user: userId }).lean();
    
    if (!mealPlan) {
        throw new ApiError(404, "Meal not found");
    }

    const normalizedMealType = normalizeMealType(mealType || mealPlan.mealType);

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fibre = 0;
    let sugar = 0;
    let sodium = 0;
    let foods = [];

    let mealLogName = mealPlan.title;

    if (mealPlan.generatedByAI && day && mealType) {
        const dayPlan = mealPlan.weeklyPlan?.find(d => d.day.toLowerCase() === day.toLowerCase()) || 
                        mealPlan.meals?.find(d => d.day.toLowerCase() === day.toLowerCase());
        if (!dayPlan) {
            throw new ApiError(400, `Meal plan for day '${day}' not found`);
        }
        
        const meal = dayPlan.meals?.find(m => (m.mealType || "").toLowerCase() === mealType.toLowerCase());
        if (!meal) {
            throw new ApiError(400, `Meal type '${mealType}' not found on ${day}`);
        }

        mealLogName = meal.mealName || meal.name || mealPlan.title;

        calories = meal.calories || 0;
        protein = meal.protein || 0;
        carbs = meal.carbs || 0;
        fat = meal.fats || meal.fat || 0;
        fibre = meal.fibre || 0;
        sugar = meal.sugar || 0;
        sodium = meal.sodium || 0;

        foods = [{
          name: meal.mealName || meal.name || mealPlan.title || "AI Meal",
          quantity: 1,
          unit: "serving",
          calories,
          protein,
          carbs,
          fat,
          fibre,
          sugar,
          sodium
        }];
    } else {
        const items = mealPlan.items && mealPlan.items.length > 0
            ? mealPlan.items
            : await MealItem.find({ mealPlan: mealId }).lean();
            
        if (items.length > 0) {
            calories = items.reduce((sum, item) => sum + ((item.calories || 0) * (parseFloat(item.quantity) || 1)), 0);
            protein = items.reduce((sum, item) => sum + ((item.protein || 0) * (parseFloat(item.quantity) || 1)), 0);
            carbs = items.reduce((sum, item) => sum + ((item.carbs || 0) * (parseFloat(item.quantity) || 1)), 0);
            fat = items.reduce((sum, item) => sum + ((item.fats || item.fat || 0) * (parseFloat(item.quantity) || 1)), 0);
            fibre = items.reduce((sum, item) => sum + ((item.fibre || 0) * (parseFloat(item.quantity) || 1)), 0);
            sugar = items.reduce((sum, item) => sum + ((item.sugar || 0) * (parseFloat(item.quantity) || 1)), 0);
            sodium = items.reduce((sum, item) => sum + ((item.sodium || 0) * (parseFloat(item.quantity) || 1)), 0);
            
            foods = items.map(item => ({
              name: item.foodName || item.name,
              quantity: parseFloat(item.quantity) || 1,
              unit: item.unit || "g",
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbs: item.carbs || 0,
              fat: item.fats || item.fat || 0,
              fibre: item.fibre || 0,
              sugar: item.sugar || 0,
              sodium: item.sodium || 0,
            }));
        } else {
            calories = mealPlan.totalCalories || 0;
            foods = [{
              name: mealPlan.title || "Custom Meal",
              quantity: 1,
              unit: "serving",
              calories
            }];
        }
    }

    const log = await MealLog.create({
        user: userId,
        mealPlan: mealId,
        mealName: mealLogName,
        mealType: normalizedMealType,
        consumedAt: new Date(),
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFat: fat,
        totalFibre: fibre,
        totalSugar: sugar,
        totalSodium: sodium,
        foods
    });
    
    return log;
};

const mealhistory = async (userId, { timeframe, search, startDate, endDate } = {}) => {
  const query = { user: userId };
  
  const dateFilter = getDateFilter(timeframe, startDate, endDate);
  if (dateFilter) {
    query.consumedAt = dateFilter;
  }
  
  if (search) {
    query.$or = [
      { mealName: { $regex: search, $options: "i" } },
      { mealType: { $regex: search, $options: "i" } },
      { "foods.name": { $regex: search, $options: "i" } }
    ];
  }
  
  const list = await MealLog.find(query).sort({ consumedAt: -1 }).populate("mealPlan").lean();
  
  return list.map(log => ({
    ...log,
    mealName: log.mealName || log.mealPlan?.title || "Custom Meal",
    mealType: log.mealType || log.mealPlan?.mealType || "lunch",
  }));
};

const logCustomMeal = async ({ userId, mealName, mealType, consumedAt, totalCalories, totalProtein, totalCarbs, totalFat, totalFibre, totalSugar, totalSodium, foods }) => {
  const log = await MealLog.create({
    user: userId,
    mealName,
    mealType: normalizeMealType(mealType),
    consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
    totalCalories: Number(totalCalories) || 0,
    totalProtein: Number(totalProtein) || 0,
    totalCarbs: Number(totalCarbs) || 0,
    totalFat: Number(totalFat) || 0,
    totalFibre: Number(totalFibre) || 0,
    totalSugar: Number(totalSugar) || 0,
    totalSodium: Number(totalSodium) || 0,
    foods: foods || []
  });
  return log;
};

const updateMealHistoryLog = async ({ userId, logId, data }) => {
  if (data.mealType) {
    data.mealType = normalizeMealType(data.mealType);
  }
  const log = await MealLog.findOneAndUpdate(
    { _id: logId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!log) {
    throw new ApiError(404, "Meal log not found");
  }
  return log;
};

const deleteMealHistoryLog = async ({ userId, logId }) => {
  const log = await MealLog.findOneAndDelete({ _id: logId, user: userId });
  if (!log) {
    throw new ApiError(404, "Meal log not found");
  }
  return log;
};

export {
    createMeal,
    getMealById,
    getAllMeals,
    updateMeal,
    deleteMeal,
    consumeMeal,
    mealhistory,
    logCustomMeal,
    updateMealHistoryLog,
    deleteMealHistoryLog
};
