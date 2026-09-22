import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  recommendations,
  simulate,
  insights,
  checkEligibility
} from '../controllers/recommendationController.js';

const router = Router();

router.use(protect);

router.get('/', recommendations);
router.post('/simulate', simulate);
router.get('/insights', insights);
router.post('/check', checkEligibility);

export default router;
