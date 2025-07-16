import { RequestHandler } from "express";
import AuthService from "../services/auth.service";
import {
  LoginRequestBody,
  ErrorResponse,
  AuthTokenResponse,
} from "../interfaces/auth.interface";
// BARU: Import model User untuk mengambil data lengkap
import User from "../models/user.model";
import { IUserResponse } from "../interfaces/user.interface";

export default class AuthController {
  static login: RequestHandler<
    {},
    AuthTokenResponse | ErrorResponse,
    LoginRequestBody
  > = async (req, res) => {
    try {
      // Panggilan ini mungkin mengembalikan objek user yang tidak lengkap
      const result = await AuthService.login(req.body);
      const loggedInUser = await User.findById(result.user.id).select(
        "-password"
      );

      if (!loggedInUser) {
        // Kasus ini seharusnya tidak terjadi jika login berhasil, tapi ini adalah pengaman
        throw new Error("User not found after login");
      }

      // Membuat objek user yang sesuai dengan tipe IUserResponse
      const userResponse: IUserResponse = {
        id: loggedInUser._id.toString(),
        username: loggedInUser.username,
        role: loggedInUser.role,
        status: loggedInUser.status,
        lastLogin: loggedInUser.lastLogin,
      };

      // Membuat respons akhir yang dijamin sesuai dengan tipe AuthTokenResponse
      const response: AuthTokenResponse = {
        success: true,
        token: result.token,
        user: userResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const status = this.getErrorStatus(error.message);
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  };

  static forgotPassword: RequestHandler = async (req, res) => {
    try {
      const { resetToken } = await AuthService.forgotPassword(
        req.body.username
      );
      res.json({
        success: true,
        message: "Reset token telah dibuat",
        token: resetToken,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
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
        message: error.message,
      });
    }
  };

  private static getErrorStatus(message: string): number {
    switch (message) {
      case "Your account is pending approval and cannot log in.":
        return 403;
      case "Your account is not active.":
        return 403;
      case "Account locked. Contact administrator.":
        return 403;
      case "Invalid credentials":
        return 401;
      case "User not found after login":
        return 404;
      case "User tidak ditemukan":
        return 404;
      default:
        return 500;
    }
  }
}
