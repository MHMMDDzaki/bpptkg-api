import { RSAMModel } from "../models/rsam.model";
import { IRSAMData } from "../interfaces/rsam.interface";

export const rsamService = {
  async getRandomRSAM(maxRsam?: number): Promise<IRSAMData> {
    const pipeline: any[] = [];
    
    // Tambahkan filter jika parameter ada
    if (maxRsam) {
      pipeline.push({ 
        $match: { 
          RSAM: { $lte: maxRsam } 
        } 
      });
    }

    pipeline.push({ $sample: { size: 1 } });

    const randomData = await RSAMModel.aggregate(pipeline);

    if (randomData.length === 0) {
      throw new Error(maxRsam 
        ? `No RSAM data found ≤ ${maxRsam}`
        : 'No RSAM data found'
      );
    }

    return randomData[0];
  },
};
