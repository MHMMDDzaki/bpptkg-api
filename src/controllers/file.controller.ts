// d:\Dev\bpptkg-api\src\controllers\file.controller.ts
import { RequestHandler } from "express";
import googleDriveService from "../services/googleDrive.service";
import { IFile, IFileResponse } from "../interfaces/file.interface";
import mongoose from "mongoose";
import RsamConfig from "../models/rsamConfig.model";

// Multer tidak lagi diimpor atau dikonfigurasi di sini

export default class FileController {
  static uploadMP3: RequestHandler<{}, IFileResponse> = async (req, res, next) => { // Tambahkan 'next'
    try {
      const file = req.file as IFile;
      if (!file) {
        // Seharusnya sudah ditangani oleh multer.middleware atau file.validator
        // Jika sampai sini dan file tidak ada, itu kondisi tak terduga.
        throw new Error("No file present in request after processing.");
      }

      console.log("Uploaded file details (controller):", file);

      const result = await googleDriveService.uploadMP3(file);
      console.log("Google Drive upload result:", result);

      if (!result || !result.id) {
        throw new Error("Failed to upload to Google Drive or missing file ID.");
      }

      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${result.id}`;
      console.log('Constructed download URL: ' + directDownloadUrl);

      // Pastikan ID ini valid atau didapatkan secara dinamis sesuai kebutuhan aplikasi Anda
      const docId = new mongoose.Types.ObjectId("6810a7f1c99ff35d7545ec02");

      const updatedConfig = await RsamConfig.findOneAndUpdate(
        { _id: docId },
        {
          audio_url: directDownloadUrl,
          audio_name: result.name,
        },
        { new: true }
      );

      console.log('Updated RsamConfig document:', updatedConfig);

      if (!updatedConfig) {
        throw new Error("RsamConfig document not found or failed to update!");
      }

      res.json({
        success: true,
        fileId: result.id,
        fileUrl: updatedConfig.audio_url,
        fileName: updatedConfig.audio_name,
      });

    } catch (error: any) {
      console.error("Error in uploadMP3 controller:", error.message);
      // Teruskan error ke global error handler di app.ts
      next(error);
    }
  };
}