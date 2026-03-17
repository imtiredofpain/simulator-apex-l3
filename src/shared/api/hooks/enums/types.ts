export type EnumUnit<Extra extends object = object> = Partial<Extra> & {
  name: string;
  description: string;
};

export type EnumsUnits<Extra extends object = object> = Record<
  string,
  EnumUnit<Extra>
>;
