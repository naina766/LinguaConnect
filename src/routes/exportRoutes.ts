import { Router } from "express";
import { exportCsv } from "../controllers/exportController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();
router.use(authMiddleware)
router.post("/export", exportCsv);

export default router;
