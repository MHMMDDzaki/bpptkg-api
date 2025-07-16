import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { registerValidator } from '../validators/user.validator';
import { verifyToken, isSuperAdmin } from '../middleware/authJwt';

const router = Router();

// Route publik untuk registrasi user baru (menjadi admin pending)
router.post('/register', registerValidator, UserController.register);

// --- Routes Khusus Superadmin ---
router.get(
    '/pending',
    [verifyToken, isSuperAdmin],
    UserController.getPendingUsers
);
router.patch(
    '/:id/approve',
    [verifyToken, isSuperAdmin],
    UserController.approveUser
);
router.delete(
    '/:id/reject',
    [verifyToken, isSuperAdmin],
    UserController.rejectUser
);


export default router;
