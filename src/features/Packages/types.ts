import type { ProductDto } from '@features/Products/types';

export interface PackageDto {
  id: number;
  packageNumber: string;
  packageLevel: number;
  emissionMethod: number;
  barcodeTemplate: number;
  ean: string;
  name: string;
  manualEmissionPattern: string;
  manualBarcodePattern: string;
  productId: number;
  childPackageId: null;
  useBuffer: boolean;
  minBufferSize: number;
}

export interface PackageDtoAdvanced extends PackageDto {
  product: ProductDto;
}

export interface CreatePackageDto {
  packageLevel: number;
  emissionMethod: number;
  barcodeTemplate: number;
  ean: string;
  name: string;
  manualEmissionPattern: string;
  manualBarcodePattern: string;
  useBuffer: boolean;
  minBufferSize: number;
  productId: number;
}
