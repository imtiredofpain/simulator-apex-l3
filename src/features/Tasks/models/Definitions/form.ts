import type { FormDefinition, SelectOption } from '@mrdn/app-common';

interface schemeFormTaskProps {
  config: {
    formId: string;
  };
  data: {
    jobTypeOptions?: SelectOption[];
    materialOptions?: SelectOption[];
    lineOptions?: SelectOption[];
    productOptions?: SelectOption[];
    packageOptions?: SelectOption[];
    productionDateTypes?: SelectOption[];
    timeUnitsOptions?: SelectOption[];
    partialReportInclusionRuleOptions?: SelectOption[];
    packageLevelRuleOptions?: SelectOption[];
  };
}


export const schemeFormTask = (props: schemeFormTaskProps): FormDefinition => {
  const 
  {
    config: {
      formId = 'task-create'
    } = {},
    data: {
      jobTypeOptions = [],
      materialOptions = [],
      lineOptions = [],
      productOptions = [],
      packageOptions = [],
      productionDateTypes = [],
      timeUnitsOptions = [],
      partialReportInclusionRuleOptions = [],
      packageLevelRuleOptions = [],
    }
  } = props; 

  return {
    version: '1.0',
    formId: formId,
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'planning',
          label: 'Планирование',
          fields: [
            'plannedQuantity',
            'jobType',
            'plannedStartDate',
            'plannedEndDate',
            'separator1',
            'advanced',
          ],
          'grid-col': 2,
        },
        {
          id: 'relations',
          label: 'Связи',
          fields: ['materialId', 'lineId', 'productId', 'packageId'],
        },
        {
          id: 'production-date',
          label: 'Правила формирования даты производства',
          fields: [
            'productionDateType',
            'fixedProductionDate',
            'productionShiftValue',
            'productionShiftUnit',
          ],
        },
        {
          id: 'partial-reports',
          label: 'Промежуточные отчеты',
          fields: ['reports'],
        },
      ],
    },
    zodSchema:
      'z.object({\\n' +
      'plannedQuantity: z.number().min(1),\\n' +
      'jobType: z.number(),\\n' +
      'plannedStartDate: z.string(),\\n' +
      'plannedEndDate: z.string(),\\n' +
      'materialId: z.number(),\\n' +
      'lineId: z.number(),\\n' +
      'productId: z.number(),\\n' +
      'packageId: z.number(),\\n' +
      'productionDateType: z.string(),\\n' +
      'fixedProductionDate: z.string().optional(),\\n' +
      'productionShiftValue: z.number().optional(),\\n' +
      'productionShiftUnit: z.string().optional(),\\n' +
      '})',
    fields: [
      {
        id: 'plannedQuantity',
        name: 'plannedQuantity',
        component: 'input',
        label: 'Плановое количество',
        required: true,
        inputType: 'number',
      },
      {
        id: 'separator1',
        name: 'separator1',
        component: 'divider',
        column: 2,
      },
      {
        id: 'separator2',
        name: 'separator2',
        component: 'divider',
        column: 1,
      },
      {
        id: 'autoSend',
        name: 'autoSend',
        component: 'switch',
        label: 'Автоматическая отправка в L2',
        description: 'Задание при создании автоматически отправится в L2',
        defaultValue: false,
      },
      {
        id: 'autoRelease',
        name: 'autoRelease',
        component: 'switch',
        label: 'Автоматически перейти в статус "подготовленно"',
        description: 'Подготовить задание к отправке на линию',
        defaultValue: false,
      },
      {
        id: 'advanced',
        name: 'advanced',
        component: 'group',
        label: 'Расширенные настройки',
        toggleable: false,
        collapsible: true,
        description: 'Управление дополнительными настройками',
        toggleName: 'urgent',
        toggleLabel: 'Свернуть/развернуть настройки',
        collapsedByDefault: false,
        column: 2,
        children: ['autoSend', 'autoRelease'],
      },
      {
        id: 'reports',
        name: 'reports',
        label: 'Промежуточные отчеты',
        description: 'Настройки промежуточных отчетов',
        component: 'group',
        toggleable: true,
        toggleName: 'partialReportUse',
        toggleLabel: 'Свернуть/развернуть настройки',
        defaultEnabled: true,
        propagateEnable: true,
        column: 2,
        children: [
          'partialReportInclusionRuleEnabled',
          'partialReportInclusionRuleTypes',
          'partialReprtStartTime',
          'partialReportInterval',
          'partialReportInclusionRule',
          'partialReportQuarantineTime',
          'partialReportQuarantineDate',
          'separator2',
          'partialReportManualUse',
        ],
      },
      {
        id: 'jobType',
        name: 'jobType',
        component: 'select',
        label: 'Тип работы',
        options: jobTypeOptions,
        defaultValue: '0',
        required: true,
      },
      {
        id: 'plannedStartDate',
        name: 'plannedStartDate',
        component: 'input',
        // @ts-ignore
        inputType: 'datetime-local',
        label: 'Плановое начало',
        required: true,
      },
      {
        id: 'plannedEndDate',
        name: 'plannedEndDate',
        component: 'input',
        // @ts-ignore
        inputType: 'datetime-local',
        label: 'Плановое окончание',
      },

      {
        id: 'materialId',
        name: 'materialId',
        component: 'select',
        label: 'Материал',
        options: materialOptions,
        visibility: {
          when: [
            {
              field: 'jobType',
              op: '!=',
              value: '1',
            },
          ],
        },
        requiredIf: {
          when: [
            {
              field: 'jobType',
              op: '!=',
              value: '1',
            },
          ],
        },
      },
      {
        id: 'lineId',
        name: 'lineId',
        component: 'select',
        label: 'Линия',
        options: lineOptions,
        required: true,
      },
      {
        id: 'productId',
        name: 'productId',
        component: 'select',
        label: 'Продукт',
        options: productOptions,
        visibility: {
          when: [
            {
              field: 'jobType',
              op: '!=',
              value: '1',
            },
          ],
        },
        requiredIf: {
          when: [
            {
              field: 'jobType',
              op: '!=',
              value: '1',
            },
          ],
        },
      },
      {
        id: 'packageId',
        name: 'packageId',
        component: 'select',
        label: 'Упаковка',
        options: packageOptions,
        visibility: {
          when: [
            {
              field: 'jobType',
              op: '=',
              value: '1',
            },
          ],
        },
        requiredIf: {
          when: [
            {
              field: 'jobType',
              op: '=',
              value: '1',
            },
          ],
        },
      },
      {
        id: 'productionDateType',
        name: 'productionDateType',
        component: 'select',
        label: 'Способ формирования даты производства',
        options: productionDateTypes,
        defaultValue: '0',
        required: true,
      },
      {
        id: 'fixedProductionDate',
        name: 'fixedProductionDate',
        component: 'input',
        // @ts-ignore
        inputType: 'datetime-local',
        label: 'Фиксированная дата производства',
        visibility: {
          when: [{ field: 'productionDateType', op: '=', value: '2' }],
        },
        // requiredIf: {
        //   when: [{ field: "productionDateType", op: "=", value: "2" }],
        // },
        clearIfHidden: true,
      },
      {
        id: 'productionShiftValue',
        name: 'productionShiftValue',
        component: 'input',
        inputType: 'number',
        label: 'Сдвиг времени производства',
        visibility: {
          when: [{ field: 'productionDateType', op: '=', value: '1' }],
        },
        requiredIf: {
          when: [{ field: 'productionDateType', op: '=', value: '1' }],
        },
        clearIfHidden: true,
      },
      {
        id: 'productionShiftUnit',
        name: 'productionShiftUnit',
        component: 'select',
        label: 'Сдвиг времени производства (ед. изм.)',
        options: timeUnitsOptions,
        visibility: {
          when: [{ field: 'productionDateType', op: '=', value: '1' }],
        },
        requiredIf: {
          when: [{ field: 'productionDateType', op: '=', value: '1' }],
        },
        clearIfHidden: true,
      },
      // {
      //   id: 'partialReportInclusionRuleEnabled',
      //   name: 'partialReportInclusionRuleEnabled',
      //   component: 'select',
      //   label: 'Отправлять отчеты об агрегации',
      //   options: [...packageLevelRuleOptions],
      // },
      {
        id: 'partialReportInclusionRuleTypes',
        name: 'partialReportInclusionRuleTypes',
        component: 'select',
        label: 'Тип упаковки для формирования отчетов',
        options: [...packageLevelRuleOptions],
      },
      {
        id: 'partialReprtStartTime',
        name: 'partialReprtStartTime',
        component: 'input',
        // @ts-ignore
        inputType: 'time',
        defaultValue: '00:00',
        label: 'Время старта',
      },
      {
        id: 'partialReportInterval',
        name: 'partialReportInterval',
        component: 'input',
        // @ts-ignore
        inputType: 'time',
        defaultValue: '00:00',
        label: 'Интервал между отчетами',
      },
      {
        id: 'partialReportInclusionRule',
        name: 'partialReportInclusionRule',
        component: 'select',
        label: 'Правило формирования отчетов',
        options: [...partialReportInclusionRuleOptions],
      },
      {
        id: 'partialReportQuarantineTime',
        name: 'partialReportQuarantineTime',
        component: 'input',
        // @ts-ignore
        inputType: 'time',
        defaultValue: '00:00',
        label: 'Карантин (время)',
        visibility: {
          when: [
            {
              field: 'partialReportInclusionRule',
              op: '=',
              value: '0',
            },
          ],
        },
      },
      {
        id: 'partialReportQuarantineDate',
        name: 'partialReportQuarantineDate',
        component: 'input',
        inputType: 'number',
        label: 'Карантин (дата)',
        visibility: {
          when: [
            {
              field: 'partialReportInclusionRule',
              op: '=',
              value: '1',
            },
          ],
        },
      },
      {
        id: 'partialReportManualUse',
        name: 'partialReportManualUse',
        component: 'switch',
        label: 'Разрешить формировать отчеты вручную',
        defaultValue: false,
      },
    ],
  };
};
