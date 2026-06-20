import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import cookieOptions from "../utils/cookieOptions.js";

const signup = asyncHandler(async (req, res, next) => {
  const result = await authService.signup(req.body);

    res.status(201).json(
      new ApiResponse(201, "User registered successfully", result.data)
    );
  
});

const login = asyncHandler(async (req, res, next) => {
  const result = await authService.login(req.body);

  let safeUser = result.user;
  if (safeUser) {
    // remove sensitive fields
    safeUser = safeUser.toObject ? safeUser.toObject() : { ...safeUser };
    delete safeUser.passwordHash;
  }

  res
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .status(200)
    .json(new ApiResponse(200, "Login successful", {
      accessToken: result.accessToken,
      user: safeUser,
    }));

});

const verifyEmail=asyncHandler(async(req,res)=>{

  const {token}=req.params;

  const response=await authService.verifyEmail(token);

  return res.status(200).json(new ApiResponse(200, "Email verified successfully", null));

});

 const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout(refreshToken);

  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Logged out successfully", null)
  );
});

 const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const tokens = await authService.refreshToken(refreshToken);

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(200, "Token refreshed successfully", {
      accessToken: tokens.accessToken,
    })
  );
});

 const logoutAllDevices = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user._id);

  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Logged out from all devices", null)
  );
});


 const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      "Current user fetched successfully",
      req.user
    )
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);
  return res.status(200).json(new ApiResponse(200, "Password reset email sent successfully", null));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  return res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, oldPassword, newPassword);
  return res.status(200).json(new ApiResponse(200, "Password changed successfully", null));
});

export { signup, login, verifyEmail, logout, refreshToken, logoutAllDevices, getCurrentUser, forgotPassword, resetPassword, changePassword };