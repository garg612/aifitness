import UserProfile from "../models/userprofile.models.js";
import ApiError from "../utils/ApiError.js";
import BMIRecord from "../models/bmirecord.models.js";
import calculateBMI from "../utils/calculateBMI.js";

const getProfile = async (userId) => {
  const profile = await UserProfile.findOne({
    user: userId,
  });

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return profile;
};

const updateProfile = async (userId, data) => {
  const currentProfile = await UserProfile.findOne({ user: userId });
  if (data.weight && currentProfile && !currentProfile.startWeight) {
    data.startWeight = data.weight;
  } else if (data.weight && !currentProfile) {
    data.startWeight = data.weight;
  }

  const profile =
    await UserProfile.findOneAndUpdate(
      {
        user: userId,
      },
      data,
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  // Log weight trend in BMIRecord database when weight or height updates
  if (data.weight !== undefined || data.height !== undefined) {
    const height = data.height !== undefined ? data.height : profile.height;
    const weight = data.weight !== undefined ? data.weight : profile.weight;
    if (height && weight) {
      const { bmi, category } = calculateBMI(height, weight);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingRecord = await BMIRecord.findOne({
        user: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existingRecord) {
        existingRecord.weight = weight;
        existingRecord.height = height;
        existingRecord.bmi = bmi;
        existingRecord.category = category;
        await existingRecord.save();
      } else {
        await BMIRecord.create({
          user: userId,
          height,
          weight,
          bmi,
          category
        });
      }
    }
  }

  return profile;
};

export {
  getProfile,
  updateProfile,
};