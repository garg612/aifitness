import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as profileService from "../services/profile.service.js";

const getProfile = asyncHandler(
  async (req, res) => {
    const profile =
      await profileService.getProfile(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Profile fetched successfully",
        profile
      )
    );
  }
);

const updateProfile =
  asyncHandler(async (req, res) => {
    const profile =
      await profileService.updateProfile(
        req.user._id,
        req.body
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Profile updated successfully",
        profile
      )
    );
  });


export { getProfile, updateProfile };