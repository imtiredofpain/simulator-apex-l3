export interface ScriptDto {
  id: number;
  name: string;
  description: string | null;
  script: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface GenerateByScriptDto {
  scriptId: number;
  quantity: number;
  parameters?: Record<string, unknown>;
}

export interface GenerateExecuteDto {
  scriptCode: string;
  quantity: number;
  parameters?: Record<string, unknown>;
}

export interface GenerateResultDto {
  success: boolean;
  codes: string[];
  error: string | null;
  executionTimeMs: number;
}
