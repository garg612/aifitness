import UserProfile from "../models/userprofile.models.js";
import ApiError from "../utils/ApiError.js";

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

  return profile;
};

export {
  getProfile,
  updateProfile,
};