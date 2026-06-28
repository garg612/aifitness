import ApiError from "../utils/ApiError.js";
import Workout from "../models/workout.models.js";
import Exercise from "../models/exercise.models.js";
import WorkoutLog from "../models/workoutlogs.models.js";

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

const createWorkout = async ({ userId, title, description, duration, difficulty, goal, type, notes, date, exercises }) => {
    const workout = await Workout.create({
        user: userId,
        title,
        description: description || "",
        duration: Number(duration),
        difficulty: difficulty || "beginner",
        goal: goal || "",
        type: type || "Strength",
        notes: notes || "",
        date: date ? new Date(date) : new Date(),
        exercises: exercises || [],
    });

    if (Array.isArray(exercises) && exercises.length > 0) {
        await Exercise.insertMany(
            exercises.map((exercise) => ({
                ...exercise,
                workout: workout._id,
            }))
        );
    }

    return workout;
};

const getallworkout = async ({ userId }) => {
    const workouts = await Workout.find({ user: userId }).sort({ createdAt: -1 }).lean();

    for (let workout of workouts) {
        if (!workout.generatedByAI) {
            const exercises = workout.exercises && workout.exercises.length > 0
                ? workout.exercises
                : await Exercise.find({ workout: workout._id });
            workout.exerciseCount = exercises.length;
            workout.caloriesBurned = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
        } else {
            const dayPlan = workout.weeklyPlan?.find(d => !d.isRestDay) || workout.weeklyPlan?.[0];
            const exercises = dayPlan?.exercises || [];
            workout.exerciseCount = exercises.length;
            workout.caloriesBurned = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
        }
    }

    return workouts;
};

const getworkoutbyid = async ({ userId, workoutId }) => {
    const workout = await Workout.findOne({
        _id: workoutId,
        user: userId,
    });

    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    let exercises = workout.exercises;
    if (!exercises || exercises.length === 0) {
        exercises = await Exercise.find({ workout: workoutId });
    }

    return {
        workout,
        exercises,
    };
};

const updateworkout = async ({ userId, workoutId, data }) => {
    const workout = await Workout.findOneAndUpdate(
        {
            _id: workoutId,
            user: userId,
        },
        data,
        { new: true, runValidators: true }
    );

    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    if (data.exercises) {
        await Exercise.deleteMany({ workout: workoutId });
        await Exercise.insertMany(
            data.exercises.map((exercise) => ({
                ...exercise,
                workout: workoutId,
            }))
        );
    }

    return workout;
};

const deleteworkout = async ({ userId, workoutId }) => {
    const workout = await Workout.findOneAndDelete({
        _id: workoutId,
        user: userId,
    });

    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    await Exercise.deleteMany({ workout: workoutId });
};

const completeworkout = async ({ userId, workoutId }) => {
    const workout = await Workout.findOne({
        _id: workoutId,
        user: userId,
    });

    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    return workout;
};

const workouthistory = async ({ userId, timeframe, search, startDate, endDate }) => {
  const query = { user: userId };
  
  const dateFilter = getDateFilter(timeframe, startDate, endDate);
  if (dateFilter) {
    query.completedAt = dateFilter;
  }
  
  if (search) {
    query.$or = [
      { workoutName: { $regex: search, $options: "i" } },
      { workoutType: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
      { "exercises.exerciseName": { $regex: search, $options: "i" } }
    ];
  }
  
  const list = await WorkoutLog.find(query).sort({ completedAt: -1 }).populate("workout").lean();
  
  return list.map(log => ({
    ...log,
    workoutName: log.workoutName || log.workout?.title || "Custom Workout",
    workoutType: log.workoutType || log.workout?.description || "Strength",
  }));
};

const logWorkout = async ({ userId, workoutId, duration, caloriesBurned }) => {
    const workout = await Workout.findOne({ _id: workoutId, user: userId }).lean();
    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    let exercises = workout.exercises || [];
    if (exercises.length === 0) {
        exercises = await Exercise.find({ workout: workoutId }).lean();
    }

    const log = await WorkoutLog.create({
        user: userId,
        workout: workoutId,
        workoutName: workout.title,
        workoutType: workout.type || "Strength",
        goal: workout.goal || "",
        difficulty: workout.difficulty || "beginner",
        notes: workout.notes || "",
        completed: true,
        status: "completed",
        duration: Number(duration) || workout.duration,
        caloriesBurned: Number(caloriesBurned) || exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0) || 300,
        completedAt: new Date(),
        exercises: exercises.map(e => ({
          exerciseName: e.exerciseName,
          sets: e.sets || 0,
          reps: e.reps || 0,
          weight: e.weight || 0,
          restTime: e.restTime || 0,
          caloriesBurned: e.caloriesBurned || 0,
          notes: e.notes || "",
        }))
    });

    return log;
};

const logCustomWorkout = async ({ userId, workoutName, workoutType, goal, difficulty, duration, caloriesBurned, notes, completedAt, exercises }) => {
  const log = await WorkoutLog.create({
    user: userId,
    workoutName,
    workoutType: workoutType || "Strength",
    goal: goal || "",
    difficulty: difficulty || "beginner",
    duration: Number(duration),
    caloriesBurned: Number(caloriesBurned),
    notes: notes || "",
    completedAt: completedAt ? new Date(completedAt) : new Date(),
    exercises: exercises || [],
    completed: true,
    status: "completed"
  });
  return log;
};

const updateWorkoutHistoryLog = async ({ userId, logId, data }) => {
  const log = await WorkoutLog.findOneAndUpdate(
    { _id: logId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!log) {
    throw new ApiError(404, "Workout log not found");
  }
  return log;
};

const deleteWorkoutHistoryLog = async ({ userId, logId }) => {
  const log = await WorkoutLog.findOneAndDelete({ _id: logId, user: userId });
  if (!log) {
    throw new ApiError(404, "Workout log not found");
  }
  return log;
};

export {
    createWorkout,
    getallworkout,
    getworkoutbyid,
    updateworkout,
    deleteworkout,
    completeworkout,
    workouthistory,
    logWorkout,
    logCustomWorkout,
    updateWorkoutHistoryLog,
    deleteWorkoutHistoryLog
};