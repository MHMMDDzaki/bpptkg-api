import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, { message: "MONGODB_URI tidak boleh kosong" }),

  // Konfigurasi JSON Web Token (JWT)
  JWT_SECRET: z.string().min(1, { message: "JWT_SECRET tidak boleh kosong" }),
  JWT_EXPIRES_IN: z.string().min(1),

  // Konfigurasi Server
  HOST: z.string().min(1).default("localhost"),
  PORT: z.coerce.number().positive().default(3000),

  // Kredensial Google Drive
  GOOGLE_DRIVE_CREDENTIALS: z
    .string()
    .min(1, { message: "Path ke kredensial Google Drive harus ada" }),
  GOOGLE_DRIVE_FOLDER_ID: z
    .string()
    .min(1, { message: "Folder ID Google Drive harus ada" }),

  // Konfigurasi API Eksternal (BPPTKG)
  API_BPPTKG: z
    .string()
    .url({ message: "API_BPPTKG harus berupa URL yang valid" }),

  // Konfigurasi Spesifik Aplikasi (RSAM)
  RSAM_CONFIG_ID: z.string().min(1, {
    message:
      "RSAM_CONFIG_ID harus berupa ObjectId yang valid (24 karakter heksadesimal)",
  }),
});

// Parse dan ekspor objek env yang sudah tervalidasi dan aman
export const env = envSchema.parse(process.env);
