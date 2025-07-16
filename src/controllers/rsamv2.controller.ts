import { Request, Response } from 'express';
import {
  getLatestRsamData,
   getRsamDataByRange as getRsamDataByRangeService
} from '../services/rsamv2.service';
import {
  IRsamData,
  IRsamRangeResponse
} from '../interfaces/rsamv2.interface';

export const getLatestRsam = async (req: Request, res: Response): Promise<void> => {
  try {
    const latestData: IRsamData = await getLatestRsamData();
    res.json(latestData);
  } catch (error) {
    console.error('Error fetching latest RSAM data:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch latest RSAM data'
    });
  }
};

export const getRsamDataByRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string;
    
    if (!range) {
      res.status(400).json({
        error: 'Missing range parameter',
        validRanges: ['3h', '6h', '12h', '24h', '48h']
      });
      return;
    }

    const data: IRsamRangeResponse = await getRsamDataByRangeService(range);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching RSAM data by range:', error.message);
    
    if (error.message.includes('Invalid time range')) {
      res.status(400).json({
        error: error.message,
        validRanges: ['3h', '6h', '12h', '24h', '48h']
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch RSAM data',
      details: error.message
    });
  }
};