import { Router } from "express";

import validate from "../middlewares/validate.middlewares.js";

import { signupSchema, loginSchema,} from "../validation/auth.validation.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import * as authController from "../controllers/auth.controllers.js";

const router = Router();

router.post("/signup",validate(signupSchema),authController.signup);

router.post("/login",validate(loginSchema),authController.login);

router.get("/verify-email/:token",authController.verifyEmail);

router.post("/refresh-token",authController.refreshToken);

router.post("/logout",verifyJWT,authController.logout);

router.post("/logout-all",verifyJWT,authController.logoutAllDevices);

router.get("/me",verifyJWT,authController.getCurrentUser);

export default router;