import { Router } from 'express';
import { rsamController } from '../controllers/rsam.controller';

const router = Router();

router.get('/', rsamController.getRandomRSAM);

export default router;