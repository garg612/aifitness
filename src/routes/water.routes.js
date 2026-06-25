import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import validate from "../middlewares/validate.middlewares.js";
import { logWaterSchema, updateWaterGoalSchema } from "../validation/water.validation.js";
import {
  logWater,
  getDailyWaterIntake,
  deleteWaterLog,
  updateWaterGoal,
} from "../controllers/water.controllers.js";

const router = Router();

router.post("/", verifyJWT, validate(logWaterSchema), logWater);
router.get("/", verifyJWT, getDailyWaterIntake);
router.delete("/:id", verifyJWT, deleteWaterLog);
router.put("/goal", verifyJWT, validate(updateWaterGoalSchema), updateWaterGoal);

export default router;
