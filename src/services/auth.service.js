import User from "../models/user.models.js";
import RefreshToken from "../models/refreshtoken.models.js";
import PasswordResetToken from "../models/PasswordResetToken.models.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken ,generateRefreshToken,verifyRefreshToken} from "../utils/jwt.js";
import hashToken from "../utils/hashToken.js";
import generateRandomToken from "../utils/generateRandomToken.js";
import EmailVerificationToken from "../models/emailVerificationToken.models.js";
import UserProfile from "../models/userprofile.models.js";
import {sendemail, emailverificationTemplate, passwordResetTemplate } from "../utils/sendEmail.js";
import logger from "../utils/logger.js";



const signup = async ({ fullName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    fullName,
    email,
    passwordHash: password,
  });

  await UserProfile.create({
    user: user._id,
    gender: "male",
    dob: new Date("1990-01-01"),
    height: 170,
    weight: 70,
    targetWeight: 65,
    startWeight: 70,
    dietPreference: "Non-Vegetarian",
    goal: "weight_loss",
    activityLevel: "moderate",
  });


  const rawtoken=generateRandomToken();
  const hashtoken=hashToken(rawtoken);



  // Email verification will be added later

  await EmailVerificationToken.create({
    user: user._id,
    tokenHash: hashtoken,
    expiresAt: new Date(Date.now() +  15 * 60 * 1000), // 15 minutes
  });
  logger.info(`Email verification token created: ${hashtoken}`);

  const verifyurl=`${process.env.FRONTEND_URL}/verify-email/${rawtoken}`;

     sendemail({
        email:user.email,
        subject:"Email Verification",
        mailgenContent:emailverificationTemplate(
          user.fullName,
          verifyurl)
    }).catch((error)=>{
        logger.error("Error sending email: ", error);
    });


  return {
    success: true,
    message: "User registered successfully, please check your email to verify your account",
  };
};




const verifyEmail=async(token)=>{
  const hashedToken=hashToken(token);

  const verificationToken=await EmailVerificationToken.findOne({tokenHash:hashedToken});

  if(!verificationToken){
    throw new ApiError(400,"Invalid or expired token");
  }

  const user=await User.findById(verificationToken.user);

  if(!user){
    throw new ApiError(400,"User not found");
  }

  if(user.isVerified){
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });
  return {
    success:true,
    message:"Email verified successfully, you can now log in"
  };
  };

  user.isVerified=true;

  await user.save();
  await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

  return {
    success: true,
    message: "Email verified successfully, you can now log in",
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  if(!user.isVerified){
    throw new ApiError(403,"Please verify your email before logging in");
  };

  const accessToken = generateAccessToken(user._id);

  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.create({
    user: user._id,
    tokenhash: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};


const logout = async (refreshToken) => {
  if (!refreshToken) return;

  await RefreshToken.deleteOne({
    tokenhash: hashToken(refreshToken),
  });
};


const refreshToken = async (incomingToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const hashedToken = hashToken(incomingToken);

  const storedToken = await RefreshToken.findOne({
    tokenhash: hashedToken,
  });

  if (!storedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Rotation
  await RefreshToken.deleteOne({
    _id: storedToken._id,
  });

  const accessToken = generateAccessToken(decoded.userId);
  const newRefreshToken = generateRefreshToken(decoded.userId);

  await RefreshToken.create({
    user: decoded.userId,
    tokenhash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutAllDevices = async (userId) => {
  await RefreshToken.deleteMany({
    user: userId,
  });
};



const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordResetToken.deleteMany({ user: user._id });

  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hashedToken,
    expiresAt,
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

  sendemail({
    email: user.email,
    subject: "Password Reset Request",
    mailgenContent: passwordResetTemplate(user.fullName, resetUrl),
  }).catch((error) => {
    logger.error("Error sending password reset email: ", error);
  });

  return {
    success: true,
    message: "Password reset link has been sent to your email",
  };
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const resetTokenRecord = await PasswordResetToken.findOne({
    tokenHash: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!resetTokenRecord) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  const user = await User.findById(resetTokenRecord.user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.passwordHash = newPassword;
  await user.save();

  await PasswordResetToken.deleteOne({ _id: resetTokenRecord._id });

  return {
    success: true,
    message: "Password has been reset successfully. You can now log in.",
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid current password");
  }

  user.passwordHash = newPassword;
  await user.save();

  return {
    success: true,
    message: "Password changed successfully",
  };
};


const sociallogin = async ({ email, fullName, provider, providerId }) => {

    let user=await User.findOne({email});

    if(!user){
      user=await User.create({
        email,
        fullName,
        provider,
        providerId,
        isVerified:true
      });

      await UserProfile.create({
        user: user._id,
        gender: "male",
        dob: new Date("1990-01-01"),
        height: 170,
        weight: 70,
        targetWeight: 65,
        startWeight: 70,
        dietPreference: "Non-Vegetarian",
        goal: "weight_loss",
        activityLevel: "moderate",
  });
    }

    const accessToken=generateAccessToken(user._id);

    const refreshToken=generateRefreshToken(user._id);

    await RefreshToken.create({
      user:user._id,
      tokenhash:hashToken(refreshToken),
      expiresAt:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      user,
      accessToken,
      refreshToken
    };
};


export { signup, login, verifyEmail, logout ,refreshToken,logoutAllDevices, requestPasswordReset, resetPassword, changePassword, sociallogin};