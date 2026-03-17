export interface MaterialDto {
  id: number
  materialNumber: string
  name: string
  materialPackages: MaterialPackages[]
}

export interface MaterialPackages {
  id: number
  packageId: number
  isActive: boolean
  packageLevel: number
}