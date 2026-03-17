import type { FormDefinition, SelectOption } from '@mrdn/app-common';

export const schemeFormLine = (
  moduleOptions: SelectOption[]
): FormDefinition => {
  return {
    version: '1.0',
    formId: 'lines-create',
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'main',
          label: 'Основное',
          fields: ['basicgroup'],
        },
      ],
    },
    zodSchema:
      "z.object({\\n  lineNumber: z.string().min(5, 'Минимум 1 символ')\\n})",
    fields: [
      {
        id: 'basicgroup',
        name: 'basicgroup',
        component: 'group',
        collapsible: false,
        defaultEnabled: false,
        propagateEnable: true,
        children: ['name', 'lineNumber', 'controlModuleId'],
      },
      {
        id: 'name',
        name: 'name',
        component: 'input',
        label: 'Наименование',
        required: true,
      },
      {
        id: 'lineNumber',
        name: 'lineNumber',
        component: 'input',
        label: 'Номер',
        prefix: 'L-',
        required: true,
      },
      {
        id: 'controlModuleId',
        name: 'controlModuleId',
        component: 'select',
        label: 'Номер устройства',
        options: moduleOptions,
        required: true,
      },
    ],
  };
};
