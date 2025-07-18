import { promises as fs } from 'fs';
import path from 'path';
import { IFile, ILocalFileResponse } from '../interfaces/file.interface';
import { env } from '../config/env';

// --- Configuration ---
const UPLOAD_DIRECTORY = env.UPLOAD_DIR;
const BASE_URL = env.BASE_URL;

/**
 * Ensures that the upload directory exists. If not, it creates it.
 */
async function ensureUploadDirExists(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIRECTORY);
  } catch (error) {
    console.log(`Upload directory not found. Creating it at: ${UPLOAD_DIRECTORY}`);
    await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
  }
}

// Ensure the directory exists when the application starts.
ensureUploadDirExists().catch(console.error);

export default {
  /**
   * Finds the first MP3 file in the upload directory.
   * @returns {Promise<string | null>} The full path of the old file or null if not found.
   */
  async findOldAudioFile(): Promise<string | null> {
    try {
      const files = await fs.readdir(UPLOAD_DIRECTORY);
      const oldAudioFile = files.find(file => path.extname(file).toLowerCase() === '.mp3');

      if (oldAudioFile) {
        return path.join(UPLOAD_DIRECTORY, oldAudioFile);
      }
      return null;
    } catch (error) {
      console.error('Error finding old audio file:', error);
      return null;
    }
  },

  /**
   * Deletes a file from the file system.
   * @param {string} filePath - The full path of the file to delete.
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Successfully deleted old file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  },

  /**
   * Saves an MP3 file to the local server directory.
   * @param {IFile} file - The file object containing the buffer.
   * @returns {Promise<ILocalFileResponse>} An object with the new file's details.
   */
  async uploadMP3(file: IFile): Promise<ILocalFileResponse> {
    try {
      const oldFilePath = await this.findOldAudioFile();
      if (oldFilePath) {
        await this.deleteFile(oldFilePath);
      }

      const newFileName = `${Date.now()}_audio.mp3`;
      const newFilePath = path.join(UPLOAD_DIRECTORY, newFileName);
      
      await fs.writeFile(newFilePath, file.buffer);
      console.log(`File uploaded successfully to: ${newFilePath}`);

      // Construct the public URL for the file
      const fileUrl = `${BASE_URL}/uploads/${newFileName}`;

      return {
        name: newFileName,
        path: newFilePath,
        url: fileUrl,
      };

    } catch (error) {
      console.error('Local Server Upload Error:', error);
      throw new Error(`Failed to upload MP3 file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
