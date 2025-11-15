import { Router } from "express";
import { exportCsv } from "../controllers/exportController";

const router = Router();
router.post("/export", exportCsv);

export default router;
