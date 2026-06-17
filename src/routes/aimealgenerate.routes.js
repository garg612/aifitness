import {Router} from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import * as aiMealController from "../controllers/aimealgenerate.controllers.js";

const router = Router();

router.post("/meal-generate",verifyJWT,aiMealController.generateAIMeal);

export default router;