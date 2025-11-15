import { Router } from "express";
import { uploadFAQ, getFAQ, uploadFAQs } from "../controllers/faqController";

const router = Router();

// Upload single FAQ
router.post("/upload", uploadFAQ);

// Get single FAQ (with optional language translation)
router.get("/", getFAQ);

// Bulk upload FAQs
router.post("/bulk-upload", uploadFAQs);

export default router;
