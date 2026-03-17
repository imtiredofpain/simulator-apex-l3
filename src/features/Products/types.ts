export interface ProductDto {
  id: number;
  productNumber: number | string;
  usageType: number;
  productGroup: number;
  notMarking: boolean;
  name: string;
  tnved: string;
  gtin: string;
  useVsd: boolean;
  useStateRegistration: boolean;
  useCertificate: boolean;
  useDeclaration: boolean;
  useLicense: boolean;
  shelfLifeValue: number;
  shelfLifeUnit: number;
}

export interface CreateProduct {
  gtin: string;
  usageType: number;
  productGroup: number;
  notMarking: boolean;
  name: string;
  tnved: string;
  useVsd: boolean;
  useStateRegistration: boolean;
  useCertificate: boolean;
  useDeclaration: boolean;
  useLicense: boolean;
  shelfLifeValue: number;
  shelfLifeUnit: number;
}
