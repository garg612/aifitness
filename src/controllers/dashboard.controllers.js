import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardService = asyncHandler(
  async (req, res) => {
    const data =
      await dashboardService.getDashboardService(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Dashboard fetched successfully",
        data
      )
    );
  }
);





