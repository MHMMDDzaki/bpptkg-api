import { Document, Types } from "mongoose";

export type UserRole = 'superadmin' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  failedLoginAttempt: number;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IUserResponse {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
}
