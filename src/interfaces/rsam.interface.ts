import { Document } from 'mongoose';

export interface IRSAMData extends Document {
  Timestamp: string;
  RSAM: number;
}