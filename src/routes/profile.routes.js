import {Router} from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import validate from "../middlewares/validate.middlewares.js";
import  { getProfile, updateProfile } from "../controllers/profile.controllers.js";
import {updateProfileSchema} from "../validation/profile.validation.js";

const router = Router();

router.get("/",verifyJWT,getProfile);
router.patch("/update",verifyJWT,validate(updateProfileSchema),updateProfile);

export default router;