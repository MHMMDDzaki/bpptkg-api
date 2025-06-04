import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { registerValidator } from '../validators/user.validator';

const router = Router();

router.post('/register', registerValidator, UserController.register);

export default router;