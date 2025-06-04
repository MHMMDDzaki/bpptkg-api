import { Types } from "mongoose";
import RsamConfig from "../models/rsamConfig.model";
import {
  IRsamConfig,
  IRsamConfigUpdate,
} from "../interfaces/rsamConfig.interface";

class RsamConfigService {
  public async getRsamConfigById(id: string): Promise<IRsamConfig | null> {
    try {
      // Validasi format ObjectId
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      const config = await RsamConfig.findById(new Types.ObjectId(id));

      if (!config) {
        throw new Error("Document not found");
      }

      return config;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch RSAM configuration");
    }
  }

  public async updateRsamConfig(
    id: string,
    updateData: IRsamConfigUpdate
  ): Promise<IRsamConfig | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      const updatedConfig = await RsamConfig.findByIdAndUpdate(
        new Types.ObjectId(id),
        updateData,
        { new: true, runValidators: true }
      );

      if (Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
      }

      if (!updatedConfig) {
        throw new Error("Document not found");
      }

      return updatedConfig;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update RSAM configuration");
    }
  }
}

export default new RsamConfigService();
