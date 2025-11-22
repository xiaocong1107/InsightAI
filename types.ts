export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'composed';
  title: string;
  xAxisKey: string;
  dataKeys: string[];
  colors: string[];
  summary: string;
}

export interface SqlResult {
  query: string;
  explanation: string;
  data: ChartDataPoint[];
}

export interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  sqlResult?: SqlResult;
  chartConfig?: ChartConfig;
  isThinking?: boolean;
}

export interface DatabaseConfig {
  host: string;
  user: string;
  database: string;
  connected: boolean;
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: string[];
}
