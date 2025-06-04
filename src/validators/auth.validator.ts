import { check } from "express-validator";
import User from "../models/user.model";
import { passwordRequirements, validate } from "../utils/validator.utils";

export const loginValidator = validate([
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Username harus diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter"),
    
  check("password")
    .notEmpty()
    .withMessage("Password harus diisi")
    .isLength({ min: passwordRequirements.minLength })
    .withMessage(`Password minimal ${passwordRequirements.minLength} karakter`)
]);

export const forgotPasswordValidator = validate([
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Username harus diisi")
    .custom(async username => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User tidak ditemukan");
      return true;
    })
]);

export const resetPasswordValidator = validate([
  check("token")
    .notEmpty()
    .withMessage("Token reset harus disertakan"),
    
  check("newPassword")
    .notEmpty()
    .withMessage("Password baru harus diisi")
    .isStrongPassword(passwordRequirements)
    .withMessage(
      `Password harus mengandung minimal:
      - ${passwordRequirements.minLength} karakter
      - ${passwordRequirements.minLowercase} huruf kecil
      - ${passwordRequirements.minUppercase} huruf besar
      - ${passwordRequirements.minNumbers} angka
      - ${passwordRequirements.minSymbols} simbol`
    )
]);