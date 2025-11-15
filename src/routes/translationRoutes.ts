import { Router } from 'express';
import { translate, detect } from '../controllers/translationController';
import { authMiddleware } from '../middleware/authMiddleware';

const r = Router();
r.use(authMiddleware);
r.post('/translate', translate);
r.post('/detect', detect);
export default r;
