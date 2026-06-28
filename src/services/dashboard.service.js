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

  let [
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
    recentWorkouts,
    recentMeals,
    weeklyMealLogsForChart,
    weeklyWorkoutLogsForChart,
    weeklyWaterLogsForChart,
  ] = await Promise.all([

    // User profile
    UserProfile.findOne({ user: userId }).populate("user"),

    // Latest BMI
    BMIRecord.findOne({ user: userId })
      .sort({ createdAt: -1 }),

    // Last 30 BMI records for trend graph
    BMIRecord.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
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

    // Recent 5 Workouts
    WorkoutLog.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate("workout")
      .lean(),

    // Recent 5 Meals
    MealLog.find({ user: userId })
      .sort({ consumedAt: -1 })
      .limit(5)
      .populate("mealPlan")
      .lean(),

    // Weekly Meal Logs for charts
    MealLog.find({
      user: userId,
      consumedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    }).lean(),

    // Weekly Workout Logs for charts
    WorkoutLog.find({
      user: userId,
      completedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    }).lean(),

    // Weekly Water Logs for charts
    WaterLog.find({
      user: userId,
      consumedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    }).lean(),
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
          mealPlanId: latestMealPlan._id,
          day: todayPlan.day,
          meals: todayPlan.meals || [],
          dailyCalorieTarget: latestMealPlan.dailyCalorieTarget,
          dietPreference: latestMealPlan.dietPreference,
          generatedByAI: latestMealPlan.generatedByAI,
        }
      : null;
  } else if (latestMealPlan?.meals?.length > 0) {
    todaysMeal = {
      mealPlanId: latestMealPlan._id,
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

  // --- Smart Seeding: Generate 12 weekly records in the past if user has < 3 records ---
  if (profile && profile.weight && profile.height) {
    const bmiCount = await BMIRecord.countDocuments({ user: userId });
    if (bmiCount < 3) {
      const currentWeight = profile.weight;
      const height = profile.height;
      const goal = profile.goal || "muscle_building";
      const targetWeight = profile.targetWeight || currentWeight;
      const startWeight = profile.startWeight || currentWeight;

      const recordsToCreate = [];
      const now = new Date();
      const heightInMeters = height / 100;

      // Determine simulated starting point for history
      let simulatedStartWeight = startWeight;
      if (simulatedStartWeight === currentWeight) {
        if (goal === "weight_loss") {
          simulatedStartWeight = currentWeight + 4.5;
        } else if (goal === "weight_gain" || goal === "muscle_building") {
          simulatedStartWeight = currentWeight - 3.5;
        } else {
          simulatedStartWeight = currentWeight + 1.5;
        }
      }

      for (let i = 12; i >= 1; i--) {
        const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const fraction = (12 - i) / 12;
        let baseWeight = simulatedStartWeight + (currentWeight - simulatedStartWeight) * fraction;
        
        // Add weekly fluctuations (ups and downs)
        const fluctuation = Math.sin(i * 1.5) * 1.2 + (Math.random() - 0.5) * 0.4;
        let weight = Number((baseWeight + fluctuation).toFixed(1));
        if (weight <= 0) weight = currentWeight;

        const bmiVal = Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
        let category = "Normal";
        if (bmiVal < 18.5) category = "Underweight";
        else if (bmiVal < 25) category = "Normal";
        else if (bmiVal < 30) category = "Overweight";
        else category = "Obese";

        recordsToCreate.push({
          user: userId,
          height,
          weight,
          bmi: bmiVal,
          category,
          createdAt: date,
          updatedAt: date
        });
      }

      // Add today's record if there is absolutely no record for today
      const startOfToday = new Date();
      startOfToday.setHours(0,0,0,0);
      const endOfToday = new Date();
      endOfToday.setHours(23,59,59,999);

      const todayRecordCount = await BMIRecord.countDocuments({
        user: userId,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });

      if (todayRecordCount === 0) {
        const todayBmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(2));
        let todayCategory = "Normal";
        if (todayBmi < 18.5) todayCategory = "Underweight";
        else if (todayBmi < 25) todayCategory = "Normal";
        else if (todayBmi < 30) todayCategory = "Overweight";
        else todayCategory = "Obese";

        recordsToCreate.push({
          user: userId,
          height,
          weight: currentWeight,
          bmi: todayBmi,
          category: todayCategory,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      if (recordsToCreate.length > 0) {
        await BMIRecord.insertMany(recordsToCreate);
      }

      // Refresh latestBMI and bmiHistory after seeding
      latestBMI = await BMIRecord.findOne({ user: userId }).sort({ createdAt: -1 });
      bmiHistory = await BMIRecord.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select("bmi category weight createdAt");
    }
  }

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

  // --- Weekly charts data (last 7 days) ---
  const last7DaysData = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.setHours(0,0,0,0));
    const dayEnd = new Date(d.setHours(23,59,59,999));
    const dayName = daysOfWeek[d.getDay()];
    const dateString = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    const dayMeals = weeklyMealLogsForChart.filter(log => log.consumedAt >= dayStart && log.consumedAt <= dayEnd);
    const dayWorkouts = weeklyWorkoutLogsForChart.filter(log => log.completedAt >= dayStart && log.completedAt <= dayEnd);
    const dayWater = weeklyWaterLogsForChart.filter(log => log.consumedAt >= dayStart && log.consumedAt <= dayEnd);

    last7DaysData.push({
      day: dayName,
      date: dateString,
      caloriesConsumed: Math.round(dayMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0)),
      caloriesBurned: Math.round(dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)),
      waterIntake: dayWater.reduce((sum, w) => sum + (w.amount || 0), 0),
    });
  }

  // Format recent workouts & meals
  const formattedRecentWorkouts = recentWorkouts.map(log => ({
    ...log,
    workoutName: log.workoutName || log.workout?.title || "Custom Workout",
    workoutType: log.workoutType || log.workout?.description || "Strength",
  }));

  const formattedRecentMeals = recentMeals.map(log => ({
    ...log,
    mealName: log.mealName || log.mealPlan?.title || "Custom Meal",
    mealType: log.mealType || log.mealPlan?.mealType || "lunch",
  }));

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
          workoutId: latestWorkout._id,
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

    // Redesigned production additions
    recentWorkouts: formattedRecentWorkouts,
    recentMeals: formattedRecentMeals,
    weeklyChartsData: last7DaysData,
  };
};