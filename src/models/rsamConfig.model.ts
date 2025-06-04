import { Schema, model } from 'mongoose';
import { IRsamConfig } from '../interfaces/rsamConfig.interface';

const rsamConfigSchema = new Schema<IRsamConfig>({
  trigger_on: { type: Number, required: true },
  trigger_off: { type: Number, required: true },
  audio_url: { type: String, required: true },
  audio_name: { type: String },
});

export default model<IRsamConfig>('RsamConfig', rsamConfigSchema, 'rsam_config');