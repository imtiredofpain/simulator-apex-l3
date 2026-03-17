import {
  BookAlert,
  BookCheck,
  BookMarked,
  BookText,
  type LucideProps,
} from "lucide-react";

export const ICON_BY_TYPE: Record<
  string,
  React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >
> = {
  GISMT_INTRODUCTION: BookText,
  SUZ_APPLICATION_REPORT: BookMarked,
  SUZ_ORDER: BookAlert,
  CRPT_PRODUCTION_REPORT: BookCheck,
};
