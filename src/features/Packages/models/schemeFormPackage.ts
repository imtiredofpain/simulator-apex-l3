import type { FormDefinition, SelectOption } from '@mrdn/app-common';

const schemeFormPackage = ({
  packLevelOptions,
  productOptions,
  emissionMethodOptions,
}: {
  packLevelOptions: SelectOption[];
  productOptions: SelectOption[];
  emissionMethodOptions: SelectOption[];
}): FormDefinition => {
  return {
    version: '1.0',
    formId: 'lines-create',
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'main',
          label: 'Основное',
          fields: ['package1', 'package2', 'separator1', 'buffer'],
          'grid-col': 2,
        },
      ],
    },
    zodSchema: 'z.object({\\n' + 'ean: z.number().min(8).max(13),\\n' + '})',
    fields: [
      {
        id: 'package1',
        name: 'package1',
        component: 'group',
        column: 1,
        children: ['packageLevel', 'gtin', 'name', 'productId'],
      },
      {
        id: 'package2',
        name: 'package2',
        component: 'group',
        column: 1,
        children: [
          'ean',
          'emissionMethod',
          'manualEmissionPattern',
          'manualBarcodePattern',
        ],
      },
      {
        id: 'buffer',
        name: 'buffer',
        component: 'group',
        label: 'Буфер кодов',
        column: 2,
        children: ['useBuffer', 'minBufferSize'],
      },
      {
        id: 'gtin',
        name: 'gtin',
        component: 'input',
        label: 'GTIN / Номер',
        required: true,
        column: 1,
      },
      {
        id: 'separator1',
        name: 'separator1',
        component: 'divider',
        column: 2,
      },
      {
        id: 'name',
        name: 'name',
        component: 'input',
        label: 'Наименование',
        placeholder: 'Наименование продукта',
        required: true,
      },
      {
        id: 'packageLevel',
        name: 'packageLevel',
        component: 'select',
        options: packLevelOptions,
        label: 'Тип логической единицы',
        required: true,
      },
      {
        id: 'productId',
        name: 'productId',
        component: 'select',
        options: productOptions,
        label: 'Продукт',
        required: true,
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
        component: 'select',
        options: emissionMethodOptions,
        label: 'Способ эмиссии',
        required: true,
      },
      {
        id: 'manualEmissionPattern',
        name: 'manualEmissionPattern',
        component: 'input',
        label: 'manualEmissionPattern',
      },
      {
        id: 'manualBarcodePattern',
        name: 'manualBarcodePattern',
        component: 'input',
        label: 'manualBarcodePattern',
      },
      {
        id: 'useBuffer',
        name: 'useBuffer',
        component: 'switch',
        label: 'Автопополнение буфера',
        defaultValue: false,
      },
      {
        id: 'minBufferSize',
        name: 'minBufferSize',
        component: 'input',
        inputType: 'number',
        label: 'Минимальный буфер',
        defaultValue: 0,
        requiredIf: {
          when: [
            {
              field: 'useBuffer',
              op: '=',
              value: true,
            },
          ],
        },
        visibility: {
          when: [
            {
              field: 'useBuffer',
              op: '=',
              value: true,
            },
          ],
        },
      },
    ],
  } as const;
};

export { schemeFormPackage };
