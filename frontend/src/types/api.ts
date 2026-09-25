export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPaginationMeta;
}

export interface HealthCheckData {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    details: string;
  };
}
