import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import validate from "../middlewares/validate.middlewares.js";
import {createBMI,getBMI } from "../controllers/bmi.controllers.js";
import {bmiSchema} from "../validation/bmi.validation.js";

const router=Router();

router.post("/",verifyJWT,validate(bmiSchema),createBMI);
router.get("/",verifyJWT,getBMI);

export default router;