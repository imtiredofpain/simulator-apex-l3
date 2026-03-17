import type { FormDefinition } from '@mrdn/app-common';

const definitionTask: FormDefinition = {
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
      id: 'id',
      name: 'id',
      component: 'input',
      label: 'id',
    },
    {
      id: 'jobNumber',
      name: 'jobNumber',
      component: 'input',
      label: 'Номер задания',
    },
    {
      id: 'jobStatus',
      name: 'jobStatus',
      component: 'input',
      label: 'Статус задания',
    },
    {
      id: 'plannedQuantity',
      name: 'plannedQuantity',
      component: 'input',
      label: 'План печати КМ (количество)',
    },
    {
      id: 'plannedStartTime',
      name: 'plannedStartTime',
      component: 'input',
      label: 'Плановое время начала',
    },
    {
      id: 'plannedEndTime',
      name: 'plannedEndTime',
      component: 'input',
      label: 'Плановое время завершения',
    },
    {
      id: 'actualStartTime',
      name: 'actualStartTime',
      component: 'input',
      label: 'Фактическое время начала',
    },
    {
      id: 'actualEndTime',
      name: 'actualEndTime',
      component: 'input',
      label: 'Фактическое время завершения',
    },
    {
      id: 'jobType',
      name: 'jobType',
      component: 'input',
      label: 'Тип задания',
    },
    {
      id: 'line',
      name: 'line',
      component: 'input',
      label: 'Линия',
    },
    {
      id: 'sum',
      name: 'sum',
      component: 'summary',
      template: [
        {
          label: 'Номер задания',
          field: 'jobNumber',
        },
        {
          label: 'Тип задания',
          field: 'jobType',
        },
        {
          label: 'Статус',
          field: 'jobStatus',
        },
        {
          label: 'План печати КМ (количество)',
          field: 'plannedQuantity',
        },
        {
          label: 'Плановое время начала',
          field: 'plannedStartTime',
        },
        {
          label: 'Плановое время завершения',
          field: 'plannedEndTime',
        },
        {
          label: 'Линия',
          field: 'line',
        },
      ],
    },
  ],
} as const;

export default definitionTask;
