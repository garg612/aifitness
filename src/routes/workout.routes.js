import { Router } from "express";
import { 
    createWorkout, 
    listWorkouts, 
    getWorkout, 
    updateWorkout, 
    deleteWorkout, 
    getworkouthistory, 
    logWorkout,
    logCustomWorkoutController,
    updateWorkoutHistoryLogController,
    deleteWorkoutHistoryLogController
} from "../controllers/workout.controllers.js";
import validate from "../middlewares/validate.middlewares.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import { createWorkoutSchema } from "../validation/workout.validation.js";

const router = Router();

router.post("/", verifyJWT, validate(createWorkoutSchema), createWorkout);
router.get("/list", verifyJWT, listWorkouts);

router.get("/history", verifyJWT, getworkouthistory);
router.post("/history", verifyJWT, logCustomWorkoutController);
router.put("/history/:logId", verifyJWT, updateWorkoutHistoryLogController);
router.delete("/history/:logId", verifyJWT, deleteWorkoutHistoryLogController);

router.get("/:id", verifyJWT, getWorkout);
router.put("/:id", verifyJWT, updateWorkout);
router.delete("/:id", verifyJWT, deleteWorkout);
router.post("/:id/log", verifyJWT, logWorkout);

export default router;