import type { LineDto } from '@features/Lines';

export interface TaskDto {
  id: number;
  jobNumber: string;
  plannedQuantity: number;
  jobType: number;
  jobStatus: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  retryAt: string;
  createdAt: string;
  updatedAt: string;
  autoSendToLine?: boolean;
  productionTimeSettings: ProductionTimeSettings;
  partialReportSettings: PartialReportSettings;
  materialId?: number;
  packageId?: number;
  lineId: LineDto['id'];
  line: LineDto;
  settings?: Record<string, unknown>;
}

export interface ProductionTimeSettings {
  calculationMethod: number;
  fixedProductionDate: string;
  timeShift: number;
  timeShiftUnit: number;
}

export interface PartialReportSettings {
  use: boolean;
  packageLevelRule: number;
  allowManual: boolean;
  startTime: string;
  interval: string;
  inclusionRule: number;
  productionTimeOffset: string;
  productionDateOffset: number;
  lastTimeAuto: string;
  lastTimeManual: string;
  needPartialReportManual: boolean;
}

export interface JobStatusDetails {
  enumKey: number;
  description: string;
}
