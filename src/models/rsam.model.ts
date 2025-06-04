import { Schema, model } from 'mongoose';
import { IRSAMData } from '../interfaces/rsam.interface';

const RSAMSchema = new Schema<IRSAMData>({
  Timestamp: { type: String, required: true },
  RSAM: { type: Number, required: true }
});

export const RSAMModel = model<IRSAMData>('RSAMData', RSAMSchema, 'rsam');