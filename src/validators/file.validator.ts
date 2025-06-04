// d:\Dev\bpptkg-api\src\validators\file.validator.ts
import { RequestHandler } from 'express';
import { IFile } from '../interfaces/file.interface';

export const fileValidator: RequestHandler = (req, res, next) => {
  const file = req.file as IFile;

  // Validasi 1: Cek file exists
  // (req.file mungkin tidak ada jika Multer menolak file karena filter atau tidak ada file yang dikirim)
  if (!file) {
    res.status(400).json({ // Tambahkan return
      success: false,
      message: 'File harus diupload atau tipe file tidak didukung.'
    });
  }

  // Validasi 2: Cek tipe file (ini bisa jadi redundan jika fileFilter di multer.middleware sudah sangat ketat)
  // Namun, sebagai lapisan pertahanan tambahan tidak masalah.
  if (file.mimetype !== 'audio/mpeg') {
    res.status(400).json({ // Tambahkan return
      success: false,
      message: 'Hanya file MP3 yang diizinkan (validator).'
    });
  }

  // Validasi 3: Cek ukuran file (juga bisa jadi redundan jika 'limits' di multer.middleware sudah bekerja)
  // Multer akan melempar error sendiri jika batas ukuran terlampaui.
  if (file.size > 10 * 1024 * 1024) { // 10MB
    res.status(400).json({ // Tambahkan return
      success: false,
      message: 'Ukuran file maksimal 10MB (validator).'
    });
  }

  next();
};