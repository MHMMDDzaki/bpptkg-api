import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db";
import rsamConfigRoutes from "./routes/rsamConfig.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import fileRoutes from "./routes/file.routes";
import RsamRoutes from "./routes/rsam.routes";
import rsamRoutesv2 from "./routes/rsamv2.routes";
import multer from "multer";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.connectDatabase();
    this.routes();
    this.errorHandling();
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private connectDatabase(): void {
    connectDB();
  }

  private routes(): void {
    this.app.use("/api/rsam-config", rsamConfigRoutes);
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/files", fileRoutes);
    this.app.use("/api/rsam-latest", RsamRoutes);
    this.app.use("/api/rsamv2-latest", rsamRoutesv2);
  }

  private errorHandling(): void {
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("GLOBAL ERROR HANDLER:");
        console.error("Message:", err.message);

        if (res.headersSent) {
          next(err);
        }

        if (err instanceof multer.MulterError) {
          let message = `File upload error: ${err.message}`;
          if (err.code === "LIMIT_FILE_SIZE") {
            message = "Ukuran file terlalu besar. Maksimal 10MB.";
          } else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Terlalu banyak file yang diupload.";
          } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Field file tidak terduga.";
          }
          res.status(400).json({ success: false, message });
        }

        if (err.message === "Invalid file type. Only MP3 files are allowed.") {
          res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
          success: false,
          message: err.message || "Terjadi kesalahan internal pada server.",
        });
      }
    );
  }
}

export default new App().app;
