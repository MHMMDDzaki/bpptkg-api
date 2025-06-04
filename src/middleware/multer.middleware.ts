// src/middleware/multer.middleware.ts
import multer from "multer";
import { Request } from "express"; // Untuk tipe pada req di fileFilter

// Konfigurasi storage
const storage = multer.memoryStorage();

// Konfigurasi filter file
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "audio/mpeg") {
    cb(null, true); // Terima file
  } else {
    // Tolak file dan berikan error. Error ini akan ditangkap oleh error handler Express.
    cb(new Error("Invalid file type. Only MP3 files are allowed."));
  }
};

// Buat instance Multer dengan konfigurasi
export const uploadMP3 = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Hanya 1 file yang diizinkan
  },
  fileFilter: fileFilter,
});