const schemeProduct = {
  version: '1.0',
  formId: 'lines-create',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'main',
        label: 'Основное',
        fields: ['sum1'],
      },
      {
        id: 'info',
        label: 'Информация',
        fields: ['sum2'],
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
      id: 'gtin',
      name: 'gtin',
      component: 'input',
      label: 'GTIN / Номер',
    },
    {
      id: 'name',
      name: 'name',
      component: 'input',
      label: 'Наименование',
    },
    {
      id: 'productGroup',
      name: 'productGroup',
      component: 'input',
      label: 'Товарная группа',
    },
    {
      id: 'tnved',
      name: 'tnved',
      component: 'input',
      label: 'ТН ВЭД',
    },
    {
      id: 'shelfLifeValue',
      name: 'shelfLifeValue',
      component: 'input',
      label: 'Срок годности',
    },
    {
      id: 'useStateRegistration',
      name: 'useStateRegistration',
      component: 'switch',
      label: 'Требуется свидетельство государственной регистрации',
    },
    {
      id: 'useStateRegistration',
      name: 'useStateRegistration',
      component: 'switch',
      label: 'Требуется свидетельство государственной регистрации',
    },
    {
      id: 'useDeclaration',
      name: 'useDeclaration',
      component: 'switch',
      label: 'Требуется декларация соответствия',
    },
    {
      id: 'sum1',
      name: 'sum1',
      component: 'summary',
      template: [
        {
          label: 'Наименование',
          field: 'name',
        },
        {
          label: 'Товарная группа',
          field: 'productGroup',
        },
        {
          label: 'GTIN / Номер',
          field: 'gtin',
        },
        {
          label: 'ТН ВЭД',
          field: 'tnved',
        },
        {
          label: 'Срок годности',
          field: 'shelfLifeValue',
        },
        {
          label: 'Требуется свидетельство государственной регистрации',
          field: 'useStateRegistration',
          format: "{{value => value ? 'Да' : 'Нет'}}",
        },
        {
          label: 'Требуется сертификат соответствия',
          field: 'useCertificate',
          format: "{{value => value ? 'Да' : 'Нет'}}",
        },
        {
          label: 'Требуется декларация соответствия',
          field: 'useDeclaration',
          format: "{{value => value ? 'Да' : 'Нет'}}",
        },
      ],
    },
    {
      id: 'sum2',
      name: 'sum2',
      component: 'summary',
      template: [],
    },
  ],
} as const;

export { schemeProduct };
