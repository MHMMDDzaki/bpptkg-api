import { IFile } from '../interfaces/file.interfaces';

declare global {
  namespace Express {
    interface Request {
      file?: IFile;
    }
  }
}