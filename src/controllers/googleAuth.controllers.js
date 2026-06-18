import { googleAuthService } from "../services/googleAuth.service.js";
import asyncHandler from "../utils/asynchandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieOptions from "../utils/cookieOptions.js";

const googleAuthcontroller = asyncHandler(async (req, res) => {

  // Accept both idToken and id_token from Postman/frontend
  const idToken = req.body.idToken || req.body.idtoken;

  if (!idToken) {
    return res.status(400).json(
      new ApiResponse(400, "Google ID token is required")
    );
  }

  const { user, accessToken, refreshToken } = await googleAuthService(idToken);

  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(200, "Google authentication successful", {
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

export { googleAuthcontroller };