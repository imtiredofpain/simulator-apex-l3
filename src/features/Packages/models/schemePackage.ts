import type { FormDefinition } from '@mrdn/app-common';

const schemePackage: FormDefinition = {
  version: '1.0',
  formId: 'lines-create',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'main',
        label: 'Основное',
        fields: ['sum'],
      },
    ],
  },
  zodSchema: '',
  fields: [
    {
      id: 'name',
      name: 'name',
      component: 'input',
      label: 'Наименование',
      required: true,
    },
    {
      id: 'gtin',
      name: 'gtin',
      component: 'input',
      label: 'GTIN / Номер',
    },
    {
      id: 'packageLevel',
      name: 'packageLevel',
      component: 'input',
      label: 'Тип логической единицы',
    },
    {
      id: 'ean',
      name: 'ean',
      component: 'input',
      label: 'EAN',
    },
    {
      id: 'emissionMethod',
      name: 'emissionMethod',
      component: 'input',
      label: 'Способ эмиссии',
    },
    {
      id: 'barcodeTemplate',
      name: 'barcodeTemplate',
      component: 'input',
      label: 'Шаблон',
    },
    {
      id: 'sum',
      name: 'sum',
      component: 'summary',
      template: [
        {
          label: 'GTIN / Номер',
          field: 'gtin',
        },
        {
          label: 'Наименование',
          field: 'name',
        },
        {
          label: 'Тип логической единицы',
          field: 'packageLevel',
        },
        {
          label: 'EAN',
          field: 'ean',
        },
        {
          label: 'Способ эмиссии',
          field: 'emissionMethod',
        },
        {
          label: 'Шаблон',
          field: 'barcodeTemplate',
        },
      ],
    },
  ],
} as const;

export { schemePackage };

export const initialValues = {
  name: 'Продукт №',
  useStateRegistration: false,
  useCertificate: false,
  useDeclaration: false,
  useLicense: false,
  useVsd: false,
  notMarking: false,
};
