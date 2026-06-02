
export interface Device {
  id: string;
  name: string;
  room: string;
  type: 'relay' | 'sensor' | 'ir' | 'ir_remote';
  status: boolean | number | string;
  value?: number;
  unit?: string;
  temperature?: number;
  humidity?: number;
  lastUpdated?: string;
  icon?: any;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  timestamp: string;
}