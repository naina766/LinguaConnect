import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as adminController from '../controllers/adminController';

const r = Router();
// r.use(authMiddleware);
r.get('/stats', adminController.getDashboardStats);
r.post('/add-language', adminController.addLanguage);
r.post('/upload-faqs', adminController.uploadFAQs);
r.get('/reports', adminController.getReports);
r.get('/stats/languages', adminController.getLanguageUsage);
r.get('/stats/weekly-activity', adminController.getWeeklyActivity);
r.get('/reports/export', adminController.exportReports);
export default r;
