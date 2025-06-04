import { Request, Response } from "express";
import { rsamService } from "../services/rsam.service";

export const rsamController = {
  async getRandomRSAM(req: Request, res: Response) {
    try {
      // Ambil parameter dari query string
      const maxRsam = req.query.maxRsam ? Number(req.query.maxRsam) : undefined;

      // Validasi angka
      if (req.query.maxRsam && isNaN(maxRsam!)) {
        res.status(400).json({
          message: "Invalid maxRsam parameter",
          error: "Parameter must be a number",
        });
      }

      const data = await rsamService.getRandomRSAM(maxRsam);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
