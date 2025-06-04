import { Document } from 'mongoose';

export interface IRsamConfig extends Document {
  trigger_on: number;
  trigger_off: number;
  audio_url: string;
  audio_name: string;
}

export interface IRsamConfigCreate {
  trigger_on: number;
  trigger_off: number;
  audio_url: string;
}

export interface IRsamConfigUpdate {
 trigger_on?: number;
 trigger_off?: number;
 audio_url?: string;
}