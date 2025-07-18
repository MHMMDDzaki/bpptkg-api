import { RequestHandler } from "express";
import localFileService from "../services/localFile.service";
import { IFile, IFileResponse } from "../interfaces/file.interface";
import mongoose from "mongoose";
import RsamConfig from "../models/rsamConfig.model";
import { env } from "../config/env";

export default class FileController {
  static uploadMP3: RequestHandler<{}, IFileResponse> = async (req, res, next) => {
    try {
      const file = req.file as IFile;
      if (!file) {
        throw new Error("No file present in request after processing.");
      }

      console.log("Uploaded file details (controller):", file);

      const result = await localFileService.uploadMP3(file);
      console.log("Local server upload result:", result);

      if (!result || !result.path) {
        throw new Error("Failed to upload to the local server.");
      }
      
      const docIdString = env.RSAM_CONFIG_ID;
      const docId = new mongoose.Types.ObjectId(docIdString);

      const rsamConfigDoc = await RsamConfig.findOne({ _id: docId });

      if (!rsamConfigDoc) {
        throw new Error(`RsamConfig document with ID ${docIdString} not found! Cannot update.`);
      }

      rsamConfigDoc.set({
        audio_url: result.url,
        audio_name: result.name
      });

      const updatedConfig = await rsamConfigDoc.save();

      console.log('Updated RsamConfig document:', updatedConfig);

      res.json({
        success: true,
        fileId: result.path, 
        fileUrl: updatedConfig.audio_url,
        fileName: updatedConfig.audio_name,
      });

    } catch (error: any) {
      console.error("Error in uploadMP3 controller:", error.message);
      next(error);
    }
  };
}