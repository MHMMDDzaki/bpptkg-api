import { check } from "express-validator";
import User from "../models/user.model";
import { passwordRequirements, validate } from "../utils/validator.utils";

export const registerValidator = validate([
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Username harus diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter")
    .custom(async username => {
      const user = await User.findOne({ username });
      if (user) throw new Error("Username sudah digunakan");
      return true;
    }),
    
  check("password")
    .notEmpty()
    .withMessage("Password harus diisi")
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