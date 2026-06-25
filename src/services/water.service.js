import WaterLog from "../models/waterlog.models.js";
import UserProfile from "../models/userprofile.models.js";
import ApiError from "../utils/ApiError.js";

const getDayRange = (dateString) => {
  const start = dateString ? new Date(dateString) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = dateString ? new Date(dateString) : new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const logWater = async ({ userId, amount, consumedAt }) => {
  const log = await WaterLog.create({
    user: userId,
    amount,
    consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
  });
  return log;
};

const getDailyWaterIntake = async ({ userId, date }) => {
  const { start, end } = getDayRange(date);

  const [logs, profile] = await Promise.all([
    WaterLog.find({
      user: userId,
      consumedAt: { $gte: start, $lte: end },
    }).sort({ consumedAt: 1 }),
    UserProfile.findOne({ user: userId }),
  ]);

  const goal = profile ? (profile.waterGoal || 2000) : 2000;
  const totalIntake = logs.reduce((sum, log) => sum + log.amount, 0);

  return {
    logs,
    goal,
    totalIntake,
  };
};

const deleteWaterLog = async ({ userId, logId }) => {
  const log = await WaterLog.findOne({ _id: logId, user: userId });
  if (!log) {
    throw new ApiError(404, "Water log not found or unauthorized");
  }

  await WaterLog.deleteOne({ _id: logId });
  return { success: true };
};

const updateWaterGoal = async ({ userId, waterGoal }) => {
  const profile = await UserProfile.findOneAndUpdate(
    { user: userId },
    { waterGoal },
    { new: true, upsert: true }
  );
  return profile;
};

export {
  logWater,
  getDailyWaterIntake,
  deleteWaterLog,
  updateWaterGoal,
};
