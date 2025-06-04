// d:\Dev\bpptkg-api\src\routes\file.routes.ts
import { Router } from 'express';
import FileController from '../controllers/file.controller';
import { fileValidator } from '../validators/file.validator';
import { verifyToken } from "../middleware/authJwt";
import { uploadMP3 } from '../middleware/multer.middleware'; // <-- IMPOR MIDDLEWARE MULTER

const router = Router();

router.post(
  '/upload-mp3',
  verifyToken,                         // 1. Verifikasi token
  uploadMP3.single("mp3_file"),        // 2. Proses upload dengan Multer (dari middleware terpisah)
  fileValidator,                       // 3. Validasi file setelah Multer
  FileController.uploadMP3             // 4. Controller utama
);

export default router;