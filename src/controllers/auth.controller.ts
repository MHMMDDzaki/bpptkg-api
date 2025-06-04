import { RequestHandler } from "express";
import AuthService from "../services/auth.service";
import {
  LoginRequestBody,
  ErrorResponse,
  AuthTokenResponse,
} from "../interfaces/auth.interface";

export default class AuthController {
  static login: RequestHandler<{}, AuthTokenResponse | ErrorResponse, LoginRequestBody> = 
    async (req, res) => {
      try {
        const result = await AuthService.login(req.body);
        res.json({ success: true, ...result });
      } catch (error: any) {
        const status = this.getErrorStatus(error.message);
        res.status(status).json({
          success: false,
          message: error.message
        });
      }
    };

  static forgotPassword: RequestHandler = async (req, res) => {
    try {
      const { resetToken } = await AuthService.forgotPassword(req.body.username);
      res.json({
        success: true,
        message: "Reset token telah dibuat",
        token: resetToken
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  };

  static resetPassword: RequestHandler = async (req, res) => {
    try {
      await AuthService.resetPassword(
        req.body.username,
        req.body.token,
        req.body.newPassword
      );
      res.json({ success: true, message: "Password berhasil diubah" });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  private static getErrorStatus(message: string): number {
    switch(message) {
      case "Account locked. Contact administrator.": return 403;
      case "Invalid credentials": return 401;
      case "User tidak ditemukan": return 404;
      default: return 500;
    }
  }
}