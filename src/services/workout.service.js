import ApiError from "../utils/ApiError.js";
import Workout from "../models/workout.models.js";
import Exercise from "../models/exercise.models.js";
import WorkoutLog from "../models/workoutlogs.models.js";

const createWorkout = async ({ userId, title, description, duration, difficulty, exercises }) => {
    const workout = await Workout.create({
        user:userId,
        title,
        description: description || "",
        duration,
        difficulty: difficulty || "beginner",
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
    return await Workout.find({ user: userId }).sort({ createdAt: -1 });
};

const getworkoutbyid = async ({ userId, workoutId }) => {
    const workout = await Workout.findOne({
        _id: workoutId,
        user: userId,
    });

    if(!workout){
        throw new ApiError(404,"Workout not found");
    }

    const exercises = await Exercise.find({ workout: workoutId });

    return {
        workout,
        exercises,
    }
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

const workouthistory = async ({ userId }) => {
    return await WorkoutLog.find({ user: userId }).sort({ completedAt: -1 }).populate("workout");
};

const logWorkout = async ({ userId, workoutId, duration, caloriesBurned }) => {
    const workout = await Workout.findOne({ _id: workoutId, user: userId });
    if (!workout) {
        throw new ApiError(404, "Workout not found");
    }

    const log = await WorkoutLog.create({
        user: userId,
        workout: workoutId,
        completed: true,
        status: "completed",
        duration: duration || workout.duration,
        caloriesBurned: caloriesBurned || 300,
        completedAt: new Date()
    });

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
};