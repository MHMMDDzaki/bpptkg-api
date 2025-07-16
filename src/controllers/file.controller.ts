import { RequestHandler } from "express";
import googleDriveService from "../services/googleDrive.service";
import { IFile, IFileResponse } from "../interfaces/file.interface";
import mongoose from "mongoose";
import RsamConfig from "../models/rsamConfig.model";
import { env } from "../config/env";

export default class FileController {
  static uploadMP3: RequestHandler<{}, IFileResponse> = async (req, res, next) => { // Tambahkan 'next'
    try {
      const file = req.file as IFile;
      if (!file) {
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
      // Jika ID ini tidak ada di database, maka RsamConfig.findById akan mengembalikan null
      const docIdString = env.RSAM_CONFIG_ID;
      const docId = new mongoose.Types.ObjectId(docIdString);

      const rsamConfigDoc = await RsamConfig.findOne({ _id: docId });

      if (!rsamConfigDoc) {
        throw new Error(`RsamConfig document with ID ${docIdString} not found! Cannot update.`);
      }

      rsamConfigDoc.set({
        audio_url: directDownloadUrl,
        audio_name: result.name
      });

      const updatedConfig = await rsamConfigDoc.save();

      console.log('Updated RsamConfig document (using findOne, set & save):', updatedConfig);

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