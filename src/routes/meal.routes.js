import {createMealcontroller,getMeal,listMeals,updateMealcontroller,deleteMealcontroller,consumeMealcontroller,mealHistory} from "../controllers/meal.controllers.js";
import {Router} from "express";
import validate from "../middlewares/validate.middlewares.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import {createMealSchema} from "../validation/meal.validation.js";

const router=Router();

router.post("/",verifyJWT,validate(createMealSchema),createMealcontroller);
router.get("/",verifyJWT,listMeals);
router.get("/history",verifyJWT,mealHistory);
router.get("/:mealId",verifyJWT,getMeal);
router.put("/:mealId",verifyJWT,updateMealcontroller);
router.delete("/:mealId",verifyJWT,deleteMealcontroller);
router.post("/:mealId/consume",verifyJWT,consumeMealcontroller);

export default router;