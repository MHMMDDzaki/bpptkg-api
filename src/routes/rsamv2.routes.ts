import { Router } from 'express';
import { 
  getLatestRsam,
  getRsamDataByRange
} from '../controllers/rsamv2.controller';

const router = Router();

// Endpoint untuk data terbaru
router.get('/', getLatestRsam);

// Endpoint untuk data rentang
router.get('/range', getRsamDataByRange);

export default router;