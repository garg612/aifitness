import UserProfile from "../models/userprofile.models.js";
import BMIRecord from "../models/bmirecord.models.js";
import Workout from "../models/workout.models.js";
import MealPlan from "../models/mealPlan.models.js";
import MealLog from "../models/meallogs.models.js";
import WorkoutLog from "../models/workoutlogs.models.js";
import WaterLog from "../models/waterlog.models.js";

// Get start and end of today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Get day name from today
const getTodayName = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

export const getDashboardService = async (userId) => {
  const { start, end } = getTodayRange();
  const todayName = getTodayName();

  const [
    profile,
    latestBMI,
    bmiHistory,
    latestWorkout,
    latestMealPlan,
    totalWorkouts,
    totalMealPlans,
    todayMealLogs,
    todayWorkoutLogs,
    weeklyWorkoutLogs,
    todayWaterLogs,
  ] = await Promise.all([

    // User profile
    UserProfile.findOne({ user: userId }).populate("user"),

    // Latest BMI
    BMIRecord.findOne({ user: userId })
      .sort({ createdAt: -1 }),

    // Last 7 BMI records for trend graph
    BMIRecord.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(7)
      .select("bmi category weight createdAt"),

    // Latest workout plan
    Workout.findOne({ user: userId })
      .sort({ createdAt: -1 }),

    // Latest meal plan
    MealPlan.findOne({ user: userId })
      .sort({ createdAt: -1 }),

    // Total workouts ever
    Workout.countDocuments({ user: userId }),

    // Total meal plans ever
    MealPlan.countDocuments({ user: userId }),

    // Today's meal logs
    MealLog.find({
      user: userId,
      consumedAt: { $gte: start, $lte: end },
    }),

    // Today's workout log
    WorkoutLog.find({
      user: userId,
      completedAt: { $gte: start, $lte: end },
    }).select("completedAt status caloriesBurned duration"),

    // This week's workout logs for consistency
    WorkoutLog.find({
      user: userId,
      completedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }).select("completedAt status"),

    // Today's water logs
    WaterLog.find({
      user: userId,
      consumedAt: { $gte: start, $lte: end },
    }).sort({ consumedAt: 1 }),
  ]);

  // Validate profile
  if (!profile) {
    const error = new Error("Profile not found. Please complete your profile.");
    error.statusCode = 404;
    throw error;
  }

  // --- Today's workout from weekly plan ---
  let todaysWorkout = null;
  if (latestWorkout?.weeklyPlan?.length > 0) {
    const todayPlan = latestWorkout.weeklyPlan.find(
      (day) => day.day === todayName
    );
    todaysWorkout = todayPlan || null;
  }

  // --- Today's meal from latest meal plan ---
  let todaysMeal = null;
  if (latestMealPlan?.weeklyPlan?.length > 0) {
    const todayPlan = latestMealPlan.weeklyPlan.find((day) => day.day === todayName);
    todaysMeal = todayPlan
      ? {
          day: todayPlan.day,
          meals: todayPlan.meals || [],
          dailyCalorieTarget: latestMealPlan.dailyCalorieTarget,
          dietPreference: latestMealPlan.dietPreference,
          generatedByAI: latestMealPlan.generatedByAI,
        }
      : null;
  } else if (latestMealPlan?.meals?.length > 0) {
    todaysMeal = {
      day: todayName,
      meals: latestMealPlan.meals,
      dailyCalorieTarget: latestMealPlan.dailyCalorieTarget,
      dietPreference: latestMealPlan.dietPreference,
      generatedByAI: latestMealPlan.generatedByAI,
    };
  }

  // Calculate daily targets based on today's planned meals
  let todayMealTargetCalories = latestMealPlan?.dailyCalorieTarget || 2000;
  let todayMealTargetProtein = 0;
  let todayMealTargetCarbs = 0;
  let todayMealTargetFats = 0;

  if (todaysMeal && Array.isArray(todaysMeal.meals) && todaysMeal.meals.length > 0) {
    const sumCalories = todaysMeal.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const sumProtein = todaysMeal.meals.reduce((sum, m) => sum + (m.protein || m.proteins || 0), 0);
    const sumCarbs = todaysMeal.meals.reduce((sum, m) => sum + (m.carbs || m.carbohydrates || 0), 0);
    const sumFats = todaysMeal.meals.reduce((sum, m) => sum + (m.fats || m.fat || 0), 0);

    if (sumCalories > 0) todayMealTargetCalories = sumCalories;
    todayMealTargetProtein = sumProtein;
    todayMealTargetCarbs = sumCarbs;
    todayMealTargetFats = sumFats;
  }

  // Fallback to profile-based macro target calculations if no targets derived from meals
  if (todayMealTargetCalories === 0 || todayMealTargetProtein === 0) {
    const calorieTarget = latestMealPlan?.dailyCalorieTarget || 2000;
    todayMealTargetCalories = calorieTarget;
    todayMealTargetProtein = Math.round((calorieTarget * 0.30) / 4);
    todayMealTargetCarbs = Math.round((calorieTarget * 0.45) / 4);
    todayMealTargetFats = Math.round((calorieTarget * 0.25) / 9);
  }

  // --- Today's calorie intake from meal logs ---
  const totalCaloriesConsumed = todayMealLogs.reduce(
    (sum, log) => sum + (log.totalCalories || 0),
    0
  );

  const totalProteinConsumed = todayMealLogs.reduce(
    (sum, log) => sum + (log.totalProtein || 0),
    0
  );

  const totalCarbsConsumed = todayMealLogs.reduce(
    (sum, log) => sum + (log.totalCarbs || 0),
    0
  );

  const totalFatsConsumed = todayMealLogs.reduce(
    (sum, log) => sum + (log.totalFat || 0),
    0
  );

  const totalCaloriesBurned = todayWorkoutLogs.reduce(
    (sum, log) => sum + (log.caloriesBurned || 0),
    0
  );

  const totalWorkoutDuration = todayWorkoutLogs.reduce(
    (sum, log) => sum + (log.duration || 0),
    0
  );

  const remainingCalories =
    todayMealTargetCalories - totalCaloriesConsumed;

  // --- BMI fallback from profile data ---
  let currentBMI = latestBMI;
  if (!currentBMI && profile?.height && profile?.weight) {
    const heightInMeters = profile.height / 100;
    const calculatedBmi = profile.weight / (heightInMeters * heightInMeters);

    let category = "Normal";
    if (calculatedBmi < 18.5) {
      category = "Underweight";
    } else if (calculatedBmi < 25) {
      category = "Normal";
    } else if (calculatedBmi < 30) {
      category = "Overweight";
    } else {
      category = "Obese";
    }

    currentBMI = {
      bmi: Number(calculatedBmi.toFixed(2)),
      category,
      weight: profile.weight,
      height: profile.height,
      createdAt: profile.updatedAt || profile.createdAt || null,
    };
  }

  // --- Weekly workout consistency ---
  const workoutConsistency = {
    completedThisWeek: weeklyWorkoutLogs.filter(
      (log) => log.status === "completed"
    ).length,
    totalThisWeek: weeklyWorkoutLogs.length,
    percentage:
      weeklyWorkoutLogs.length > 0
        ? Math.round(
            (weeklyWorkoutLogs.filter((l) => l.status === "completed").length /
              weeklyWorkoutLogs.length) *
              100
          )
        : 0,
  };

  // --- Goal progress (weight based) ---
  let goalProgress = null;
  if (
    profile.targetWeight &&
    currentBMI?.weight &&
    profile.startWeight
  ) {
    const totalToLose = Math.abs(profile.startWeight - profile.targetWeight);
    const lost = Math.abs(profile.startWeight - currentBMI.weight);
    const percentage =
      totalToLose > 0 ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;

    goalProgress = {
      startWeight: profile.startWeight,
      currentWeight: currentBMI.weight,
      targetWeight: profile.targetWeight,
      progressPercentage: percentage,
    };
  }

  return {
    // Greeting info
    greeting: {
      name: profile.user?.fullName,
      today: todayName,
      date: new Date().toDateString(),
    },

    // Profile summary
    profile: {
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      dietPreference: profile.dietPreference,
      height: profile.height,
      weight: currentBMI?.weight || profile.weight,
    },

    // BMI info
    bmi: {
      current: currentBMI?.bmi || null,
      category: currentBMI?.category || null,
      weight: currentBMI?.weight || null,
      height: currentBMI?.height || null,
      lastUpdated: currentBMI?.createdAt || null,
      trend: bmiHistory.reverse(), // oldest to newest for graph
    },

    // Today's workout from weekly plan
    todaysWorkout: todaysWorkout
      ? {
          day: todaysWorkout.day,
          focus: todaysWorkout.focus,
          isRestDay: todaysWorkout.isRestDay,
          exercises: todaysWorkout.exercises || [],
          isCompleted: todayWorkoutLogs.length > 0,
        }
      : null,

    // Today's meal plan
    todaysMeal,

    // Today's calorie tracking
    todayNutrition: {
      caloriesConsumed: totalCaloriesConsumed,
      caloriesRemaining: remainingCalories > 0 ? remainingCalories : 0,
      dailyTarget: todayMealTargetCalories,
      targetProtein: todayMealTargetProtein,
      targetCarbs: todayMealTargetCarbs,
      targetFats: todayMealTargetFats,
      mealsLogged: todayMealLogs.length,
      caloriesBurned: totalCaloriesBurned,
      workoutDuration: totalWorkoutDuration,
      workoutsLogged: todayWorkoutLogs.length,
      macros: {
        protein: totalProteinConsumed,
        carbs: totalCarbsConsumed,
        fats: totalFatsConsumed,
      },
    },

    // Weekly consistency
    workoutConsistency,

    // Overall stats
    stats: {
      totalWorkouts,
      totalMealPlans,
      aiWorkouts: await Workout.countDocuments({
        user: userId,
        generatedByAI: true,
      }),
      aiMealPlans: await MealPlan.countDocuments({
        user: userId,
        generatedByAI: true,
      }),
    },

    // Goal progress
    goalProgress,

    // Today's water intake
    todayWater: {
      logs: todayWaterLogs,
      goal: profile ? (profile.waterGoal || 2000) : 2000,
      totalIntake: todayWaterLogs.reduce((sum, log) => sum + log.amount, 0),
    },
  };
};