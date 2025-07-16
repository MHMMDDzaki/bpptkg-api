import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { IUserResponse } from "../interfaces/user.interface";

export default class UserService {
  // MODIFIKASI: Method registerUser tidak lagi mengembalikan token
  static async registerUser(
    username: string,
    password: string
  ): Promise<Pick<IUserResponse, "id" | "username" | "role" | "status">> {
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error("Username already exists");

      // Saat registrasi, role otomatis 'admin' dan status 'pending'
      const newUser = new User({
        username,
        password,
        role: "admin",
        status: "pending",
      });
      const savedUser = await newUser.save();

      // Tidak ada pembuatan token di sini
      return {
        id: savedUser._id.toString(),
        username: savedUser.username,
        role: savedUser.role,
        status: savedUser.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // BARU: Method untuk menyetujui user oleh superadmin
  static async approveUser(userId: string): Promise<IUserResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === "active") {
      throw new Error("User is already active");
    }

    user.status = "active";
    await user.save();

    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
    };
  }

  static async rejectUser(userId: string): Promise<IUserResponse> {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return {
      id: deletedUser._id.toString(),
      username: deletedUser.username,
      role: deletedUser.role,
      status: deletedUser.status, // status akan 'pending'
    };
  }

  // BARU: Method untuk mendapatkan semua user yang pending
  static async getPendingUsers(): Promise<IUserResponse[]> {
    const users = await User.find({ status: "pending" }).select("-password");
    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      status: user.status,
    }));
  }
}
