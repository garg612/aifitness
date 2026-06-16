import User from "../models/user.models.js";
import RefreshToken from "../models/refreshtoken.models.js";

import ApiError from "../utils/ApiError.js";
import { generateAccessToken ,generateRefreshToken,verifyRefreshToken} from "../utils/jwt.js";
import hashToken from "../utils/hashToken.js";
import generateRandomToken from "../utils/generateRandomToken.js";
import EmailVerificationToken from "../models/emailVerificationToken.models.js";
import {sendemail, emailverificationTemplate } from "../utils/sendEmail.js";



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

  const rawtoken=generateRandomToken();
  const hashtoken=hashToken(rawtoken);



  // Email verification will be added later

  await EmailVerificationToken.create({
    user: user._id,
    tokenHash: hashtoken,
    expiresAt: new Date(Date.now() +  15 * 60 * 1000), // 15 minutes
  });

  const verifyurl=`${process.env.FRONTEND_URL}/verify-email/${rawtoken}`;

     sendemail({
        email:user.email,
        subject:"Email Verification",
        mailgenContent:emailverificationTemplate(
          user.fullName,
          verifyurl)
    }).catch((error)=>{
        console.error("Error sending email:",error);
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
    tokenHash: hashToken(refreshToken),
  });
};


const refreshToken = async (incomingToken) => {
  const decoded = verifyRefreshToken(incomingToken);

  const hashedToken = hashToken(incomingToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash: hashedToken,
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
    tokenHash: hashToken(newRefreshToken),
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



export { signup, login, verifyEmail, logout ,refreshToken,logoutAllDevices};