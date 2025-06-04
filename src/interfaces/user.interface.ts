import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
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
  lastLogin?: Date;
}