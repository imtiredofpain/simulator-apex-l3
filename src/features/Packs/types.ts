export interface PackDto {
  id: number;
  packageLevel: string;
  status: string;
  reservedForJobId : number | null;
  createdAt: string;
}

export interface PackDetailDto {
  id: number;
  ic: string;
  inn: string;
  level: string;
  status: string;
  productionStatus: string;
  createdAt: string;
  parentId: number | null;
  packageId: number;
  childrenCount: number;

  currentState: {
    fill: boolean;
    sentToPrint: boolean;
    read: boolean;
    confirmed: boolean;
    dropout: boolean;
    aggregated: boolean;
    packaged: boolean;
    invalid: boolean;
    isNew: boolean;
    reserved: boolean;
  };

  allFlags: {
    reserved: boolean;
    sentToPrint: boolean;
    read: boolean;
    fill: boolean;
    confirmed: boolean;
    aggregated: boolean;
    packaged: boolean;
    invalid: boolean;
    localError: boolean;
    nestedError: boolean;
    producedReported: boolean;
    productionJobSendToLine: boolean;
    preprintJobSendToLine: boolean;
  };

  code: {
    ic: string;
    lotNumber: string;
    productionTime: string | null;
    expirationTime: string | null;
  };
}


export interface PackStatsDto {
  jobId: number;
  total: number;
  packIds: Array<number>;
  byLevel: Array<{
    level: string;
    count: number;
  }>;
  
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  byProductionStatus: Array<{
    status: string;
    count: number;
  }>;
  flags: {
    reserved: number;
    sentToPrint: number;
    read: number;
    fill: number;
    confirmed: number;
    aggregated: number;
    packaged: number;
    invalid: number;
    withErrors: number;
    producedReported: number;
    productionJobSendToLine: number;
    preprintJobSendToLine: number;
  };
}
