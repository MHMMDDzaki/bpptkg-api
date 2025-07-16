import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // BARU: Tambahkan field role dan status
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
      required: true,
    },
    lastLogin: { type: Date },
    failedLoginAttempt: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

// Hash password sebelum menyimpan
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method untuk compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
