import UserProfile from "../models/userprofile.models.js";
import BMIRecord from "../models/bmirecord.models.js";
import Workout from "../models/workout.models.js";
import MealPlan from "../models/mealPlan.models.js";
import MealLog from "../models/meallogs.models.js";
import WorkoutLog from "../models/workoutlogs.models.js";

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
    todayWorkoutLog,
    weeklyWorkoutLogs,
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
    WorkoutLog.findOne({
      user: userId,
      completedAt: { $gte: start, $lte: end },
    }),

    // This week's workout logs for consistency
    WorkoutLog.find({
      user: userId,
      completedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }).select("completedAt status"),
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
  if (latestMealPlan?.meals?.length > 0) {
    todaysMeal = {
      dailyCalorieTarget: latestMealPlan.dailyCalorieTarget,
      dietPreference: latestMealPlan.dietPreference,
      meals: latestMealPlan.meals,
      generatedByAI: latestMealPlan.generatedByAI,
    };
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

  const remainingCalories =
    (latestMealPlan?.dailyCalorieTarget || 0) - totalCaloriesConsumed;

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
    latestBMI?.weight &&
    profile.startWeight
  ) {
    const totalToLose = Math.abs(profile.startWeight - profile.targetWeight);
    const lost = Math.abs(profile.startWeight - latestBMI.weight);
    const percentage =
      totalToLose > 0 ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;

    goalProgress = {
      startWeight: profile.startWeight,
      currentWeight: latestBMI.weight,
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
      weight: latestBMI?.weight || profile.weight,
    },

    // BMI info
    bmi: {
      current: latestBMI?.bmi || null,
      category: latestBMI?.category || null,
      weight: latestBMI?.weight || null,
      height: latestBMI?.height || null,
      lastUpdated: latestBMI?.createdAt || null,
      trend: bmiHistory.reverse(), // oldest to newest for graph
    },

    // Today's workout from weekly plan
    todaysWorkout: todaysWorkout
      ? {
          day: todaysWorkout.day,
          focus: todaysWorkout.focus,
          isRestDay: todaysWorkout.isRestDay,
          exercises: todaysWorkout.exercises || [],
          isCompleted: !!todayWorkoutLog,
        }
      : null,

    // Today's meal plan
    todaysMeal,

    // Today's calorie tracking
    todayNutrition: {
      caloriesConsumed: totalCaloriesConsumed,
      caloriesRemaining: remainingCalories > 0 ? remainingCalories : 0,
      dailyTarget: latestMealPlan?.dailyCalorieTarget || 0,
      mealsLogged: todayMealLogs.length,
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
  };
};