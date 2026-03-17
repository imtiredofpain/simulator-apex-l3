export interface ApiEnvelope<TData = unknown> {
  isSuccess: boolean;
  statusCode: number;
  message?: string;
  data: TData;
  timestamp: string;
}

export interface ApiPagedEnvelope<TData = unknown> extends ApiEnvelope {
  pagination: {
    page: number;
    pages: number;
    size: number;
    total: number;
  };
  data: TData;
}
