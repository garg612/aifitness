import { microsoftAuthService } from "../services/microsoftAuth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieOptions from "../utils/cookieOptions.js";

const microsoftAuthController = asyncHandler(async (req, res) => {

  const idToken = req.body.idToken || req.body.id_token || req.body.idtoken;

  if (!idToken) {
    return res.status(400).json(
      new ApiResponse(400, "Microsoft ID token is required")
    );
  }

  const { user, accessToken, refreshToken } = await microsoftAuthService(idToken);

  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(200, "Microsoft authentication successful", {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          provider: user.provider,
          isVerified: user.isVerified,
        },
        accessToken,
      })
    );
});

export { microsoftAuthController };