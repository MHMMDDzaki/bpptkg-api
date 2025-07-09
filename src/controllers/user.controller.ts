import { RequestHandler } from "express";
import UserService from "../services/user.service";
import {
  RegisterRequestBody,
  ErrorResponse,
} from "../interfaces/auth.interface";
import { IUserResponse } from "../interfaces/user.interface";

// Definisikan tipe response untuk registrasi
type RegisterSuccessResponse = {
  success: true;
  message: string;
  user: Pick<IUserResponse, "id" | "username" | "role" | "status">;
};

export default class UserController {
  // MODIFIKASI: Handler registrasi
  static register: RequestHandler<
    {},
    RegisterSuccessResponse | ErrorResponse,
    RegisterRequestBody
  > = async (req, res) => {
    try {
      const newUser = await UserService.registerUser(
        req.body.username,
        req.body.password
      );
      // Respon sukses dengan pesan bahwa akun menunggu persetujuan
      res.status(201).json({
        success: true,
        message: "Registration successful. Your account is pending approval.",
        user: newUser,
      });
    } catch (error: any) {
      const status = error.message === "Username already exists" ? 409 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  };

  // BARU: Handler untuk mendapatkan user yang pending
  static getPendingUsers: RequestHandler = async (req, res) => {
    try {
      const users = await UserService.getPendingUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // BARU: Handler untuk menyetujui user
  static approveUser: RequestHandler<{ id: string }> = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.approveUser(id);
      res.status(200).json({
        success: true,
        message: `User ${updatedUser.username} has been approved.`,
        user: updatedUser,
      });
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  };

  static rejectUser: RequestHandler<{ id: string }> = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.rejectUser(id);
      res.status(200).json({
        success: true,
        message: `User ${deletedUser.username} has been rejected and deleted.`,
        user: deletedUser
      });
    } catch (error: any) {
      // Jika user tidak ditemukan, service akan melempar error.
      const status = error.message === "User not found" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  };
}
