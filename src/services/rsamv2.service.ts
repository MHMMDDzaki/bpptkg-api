import axios from 'axios';
import moment from 'moment-timezone';
import {
  IRsamData,
  IRsamRangeResponse
} from '../interfaces/rsamv2.interface';

const API_BASE_URL = process.env.API_BPPTKG || 'http://192.168.0.45:16030/rsam/';

const RANGE_MAPPING: Record<string, number> = {
  '30m': 30,
  '1h': 60,
  '2h': 120,
  '4h': 240,
  '8h': 480,
  '16h': 960,
  '1d': 1440,
  '2d': 2880
};

// Helper untuk parse CSV
function parseCustomCsv(csvData: string): IRsamData[] {
  const lines = csvData.trim().split('\n');
  const mapPerMinute: Record<string, IRsamData> = {};

  for (const line of lines) {
    if (!line.trim()) continue;

    const [rawTimestamp, rawValue] = line.split(',');
    const timestamp = rawTimestamp.trim();
    const RSAM = parseFloat(rawValue.trim());

    if (isNaN(RSAM)) continue;

    // Ambil hanya hingga menit
    const minuteKey = moment(timestamp).format('YYYY-MM-DD HH:mm');

    // Simpan data terakhir di menit tersebut (overwrite)
    mapPerMinute[minuteKey] = {
      Timestamp: timestamp,
      RSAM
    };
  }

  // Kembalikan sebagai array
  return Object.values(mapPerMinute);
}

// Fungsi untuk data terbaru
export const getLatestRsamData = async (): Promise<IRsamData> => {
  const params = {
    code: 'MEPAS_HHZ_VG_00',
    t1: '-0.020833', // 30 menit terakhir (30/1440 = 0.020833)
    rsamP: '10',
    tz: 'Asia/Jakarta',
    csv: '1'
  };

  const response = await axios.get<string>(API_BASE_URL, {
    params,
    responseType: 'text',
    timeout: 10000
  });

  const lines = response.data.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  const [timestamp, value] = lastLine.split(',');

  return {
    Timestamp: timestamp.trim(),
    RSAM: parseFloat(value.trim())
  };
};

// Fungsi untuk data rentang
export const getRsamDataByRange = async (range: string): Promise<IRsamRangeResponse> => {
  if (!RANGE_MAPPING[range]) {
    throw new Error('Invalid time range');
  }

  const minutes = RANGE_MAPPING[range];
  const t1Value = `-${minutes / 1440}`;
  const startTime = moment().tz('Asia/Jakarta').subtract(minutes, 'minutes');
  const endTime = moment().tz('Asia/Jakarta');

  const params = {
    code: 'MEPAS_HHZ_VG_00',
    t1: t1Value,
    rsamP: '10',
    tz: 'Asia/Jakarta',
    csv: '1'
  };

  const response = await axios.get(API_BASE_URL, {
    params,
    timeout: 10000
  });

  const data = parseCustomCsv(response.data);

  return {
    range,
    startTime: startTime.format('YYYY-MM-DDTHH:mm:ss'),
    endTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
    data
  };
};