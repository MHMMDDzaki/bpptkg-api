import { google } from "googleapis";
import { Readable } from "stream";
import { IFile, IGoogleDriveResponse } from "../interfaces/file.interface";

const keyFile = "./google-credentials.json";

const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export default {
  async findOldAudioFile(folderId: string): Promise<string | null> {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'audio/mpeg' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 1,
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    return null;
  },

  async deleteFile(fileId: string): Promise<void> {
    await drive.files.delete({ fileId });
  },

  async uploadMP3(file: IFile): Promise<IGoogleDriveResponse> {
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
      
      // 🔍 Cek apakah ada file lama
      const oldFileId = await this.findOldAudioFile(folderId);
      if (oldFileId) {
        await this.deleteFile(oldFileId);
      }

      const fileMetadata = {
        name: `${Date.now()}_audio`,
        parents: [folderId],
        mimeType: 'audio/mpeg'
      };

      const media = {
        mimeType: 'audio/mpeg',
        body: Readable.from(file.buffer)
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,webViewLink,name'
      });

      return {
        id: response.data.id!,
        url: response.data.webViewLink!,
        name: response.data.name!
      };

    } catch (error) {
      console.error('Google Drive Error:', error);
      throw new Error('Gagal mengupload file MP3');
    }
  }
};
