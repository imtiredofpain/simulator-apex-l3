import type { ControlModuleDto } from '@features/ControlModules/types';

export interface LineDto {
  id: string;
  lineNumber: string;
  name: string;
  controlModule: ControlModuleDto;
}

export interface LineCreateDto {
  lineNumber: string;
  name: string;
  controlModuleName: string;
}
