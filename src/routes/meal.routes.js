import { 
    createMealcontroller, 
    getMeal, 
    listMeals, 
    updateMealcontroller, 
    deleteMealcontroller, 
    consumeMealcontroller, 
    mealHistory,
    logCustomMealController,
    updateMealHistoryLogController,
    deleteMealHistoryLogController
} from "../controllers/meal.controllers.js";
import { Router } from "express";
import validate from "../middlewares/validate.middlewares.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import { createMealSchema } from "../validation/meal.validation.js";

const router = Router();

router.post("/", verifyJWT, validate(createMealSchema), createMealcontroller);
router.get("/", verifyJWT, listMeals);

router.get("/history", verifyJWT, mealHistory);
router.post("/history", verifyJWT, logCustomMealController);
router.put("/history/:logId", verifyJWT, updateMealHistoryLogController);
router.delete("/history/:logId", verifyJWT, deleteMealHistoryLogController);

router.get("/:mealId", verifyJWT, getMeal);
router.put("/:mealId", verifyJWT, updateMealcontroller);
router.delete("/:mealId", verifyJWT, deleteMealcontroller);
router.post("/:mealId/consume", verifyJWT, consumeMealcontroller);

export default router;