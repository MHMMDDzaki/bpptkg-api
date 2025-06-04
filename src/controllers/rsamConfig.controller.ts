import { Request, Response } from "express";
import rsamConfigService from "../services/rsamConfig.service";
import { IRsamConfigUpdate } from "../interfaces/rsamConfig.interface";

class RsamConfigController {
  public async getRsamConfig(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const config = await rsamConfigService.getRsamConfigById(req.params.id);

      if (!config) {
        res.status(404).json({ message: "Document not found" });
        return;
      }

      res.json(config);
    } catch (error: any) {
      const statusCode = error.message.includes("Invalid ID format")
        ? 400
        : 500;
      res.status(statusCode).json({
        message: error.message,
      });
    }
  }

  public async updateRsamConfig(
    req: Request<{ id: string }, {}, IRsamConfigUpdate>,
    res: Response
  ): Promise<void> {
    try {
      const allowedFields: Array<keyof IRsamConfigUpdate> = [
        "trigger_on",
        "trigger_off",
        "audio_url",
      ];

      // 2. Type guard function
      const isAllowedKey = (key: string): key is keyof IRsamConfigUpdate => {
        return allowedFields.includes(key as keyof IRsamConfigUpdate);
      };

      // 3. Filter dan construct update object
      const filteredUpdate = {} as IRsamConfigUpdate;

      for (const key of Object.keys(req.body)) {
        if (isAllowedKey(key)) {
          // 4. Type-safe assignment
          const value = req.body[key];
          if (value !== undefined) {
            filteredUpdate[key] = value as never;
          }
        }
      }
      
      // 5. Validasi jika tidak ada field yang valid
      if (Object.keys(filteredUpdate).length === 0) {
       res.status(400).json({ message: 'No valid fields to update' });
       return;
     }

      const updatedConfig = await rsamConfigService.updateRsamConfig(
        req.params.id,
        filteredUpdate
      );

      res.json(updatedConfig);
    } catch (error: any) {
      const statusCode = error.message.includes("Invalid ID format")
        ? 400
        : error.message.includes("not found")
        ? 404
        : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

export default new RsamConfigController();
