import { Router } from "express";

import verifyJWT from "../middlewares/verifyJWT.js";

import { getDashboardService } from "../controllers/dashboard.controllers.js";

const router = Router();

router.get("/", verifyJWT, getDashboardService);

export default router;