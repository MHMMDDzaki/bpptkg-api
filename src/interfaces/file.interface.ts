import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    file?: IFile;
  }
}

export interface IFile extends Express.Multer.File {
  // Properti custom bisa ditambahkan di sini
}

export interface IFileResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  message?: string;
}

export interface IGoogleDriveResponse {
  id: string;
  url: string;
  name: string;
}