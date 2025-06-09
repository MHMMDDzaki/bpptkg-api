import { LoginRequestBody } from "../interfaces/auth.interface";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import * as crypto from "crypto";

export default class AuthService {
  static async login(loginData: LoginRequestBody) {
    try {
      const user = await User.findOne({ username: loginData.username })
        .select("+password")
        .orFail()
        .exec();

      if (user.isLocked) {
        throw new Error("Account locked. Contact administrator.");
      }

      const isMatch = await user.comparePassword(loginData.password);
      if (!isMatch) {
        user.failedLoginAttempt += 1;
        if (user.failedLoginAttempt >= 5) user.isLocked = true;
        await user.save();
        throw new Error("Invalid credentials");
      }

      user.failedLoginAttempt = 0;
      user.lastLogin = new Date();
      await user.save();

      const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as StringValue;
      
      const token = jwt.sign(
        { userId: user._id.toString(), username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn }
      );

      return {
        token: token,
        user: {
          id: user._id.toString(),
          username: user.username,
          lastLogin: user.lastLogin
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(username: string) {
    try {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User tidak ditemukan");

      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 1000); // 1 jam

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await user.save();

      return { resetToken };
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(username: string, token: string, newPassword: string) {
    try {
      const user = await User.findOne({
        username,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) throw new Error("Token invalid atau kadaluarsa");

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}