export interface LogsDto {
  id: number;
  integration: string;
  channel: string;
  operation: string;
  httpMethod: string;
  url: string;
  statusCode: number;
  durationMs: number;
  startedAtUtc: string;
  finishedAtUtc: string;
  correlationId: string;
  organizationId: number;
}

export interface LogsAdvancedDto {
  requestHeaders: string;
  requestBody?: string;
  responseHeaders: string;
  responseBody: string;
  exceptionMessage?: string;
  exceptionStackTrace?: string;
  metadata: string;
  id: number;
  integration: string;
  channel: string;
  operation: string;
  httpMethod: string;
  url: string;
  statusCode: number;
  durationMs: number;
  startedAtUtc: string;
  finishedAtUtc: string;
  correlationId: string;
  organizationId: number;
}
