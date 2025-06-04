export interface IRsamData {
  Timestamp: string;
  RSAM: number;
}

export interface IRsamRangeResponse {
  range: string;
  startTime: string;
  endTime: string;
  data: IRsamData[];
}
