import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { 
 loginValidator,
 forgotPasswordValidator,
 resetPasswordValidator 
} from '../validators/auth.validator';

const router = Router();

router.post('/login', loginValidator, AuthController.login);
router.post('/forgot-password', forgotPasswordValidator, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, AuthController.resetPassword);

export default router;