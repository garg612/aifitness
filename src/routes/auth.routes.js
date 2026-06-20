import { Router } from "express";

import validate from "../middlewares/validate.middlewares.js";

import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../validation/auth.validation.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import * as authController from "../controllers/auth.controllers.js";
import { microsoftAuthController } from "../controllers/microsoftAuth.controllers.js";
import { googleAuthcontroller } from "../controllers/googleAuth.controllers.js";



const router = Router();

router.post("/signup",validate(signupSchema),authController.signup);

router.post("/login",validate(loginSchema),authController.login);

router.get("/verify-email/:token",authController.verifyEmail);

router.post("/refresh-token",authController.refreshToken);

router.post("/logout",verifyJWT,authController.logout);

router.post("/logout-all",verifyJWT,authController.logoutAllDevices);

router.get("/me",verifyJWT,authController.getCurrentUser);

router.post("/forgot-password",validate(forgotPasswordSchema),authController.forgotPassword);

router.post("/reset-password",validate(resetPasswordSchema),authController.resetPassword);

router.post("/change-password", verifyJWT, validate(changePasswordSchema), authController.changePassword);

router.post("/google", googleAuthcontroller);
router.post("/microsoft", microsoftAuthController);
export default router;