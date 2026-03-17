import type { FormDefinition, SelectOption } from '@mrdn/app-common';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';

const schemeFormProduct = ({
  productGroups,
  shelfLife,
  usageTypes,
}: {
  productGroups: EnumsUnits;
  shelfLife: EnumsUnits;
  usageTypes: EnumsUnits;
}): FormDefinition => {
  const productGroupsOptions: SelectOption[] = Object.keys(productGroups).map(
    (key) => ({ value: key, label: productGroups[key].description })
  );

  const shelfLifeOptions: SelectOption[] = Object.keys(shelfLife).map(
    (key) => ({
      value: key,
      label: shelfLife[key].description + ' - ' + shelfLife[key].name,
    })
  );
  const usageTypesOptions: SelectOption[] = Object.keys(usageTypes).map(
    (key) => ({ value: key, label: usageTypes[key].description })
  );
  return {
    version: '1.0',
    formId: 'lines-create',
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'main',
          label: 'Основное',
          fields: ['basicgroup', 'advancegroup'],
        },
      ],
    },
    zodSchema: '',
    fields: [
      {
        id: 'basicgroup',
        name: 'basicgroup',
        component: 'group',
        collapsible: false,
        defaultEnabled: false,
        propagateEnable: true,
        children: [
          'name',
          'productGroup',
          'notMarking',
          'gtin',
          'tnved',
          'shelfLifeValue',
          'shelfLifeUnit',
          'usageType',
          'useStateRegistration',
          'useCertificate',
          'useDeclaration',
          'useVsd',
          'useLicense',
        ],
      },
      // {
      //   id: 'advancegroup',
      //   name: 'advancegroup',
      //   component: 'group',
      //   label: 'Дополнительные свойства',
      //   collapsible: false,
      //   defaultEnabled: false,
      //   propagateEnable: true,
      //   children: [],
      // },
      {
        id: 'productGroup',
        name: 'productGroup',
        component: 'select',
        options: productGroupsOptions,
        label: 'Товарная группа',
        required: true,
      },
      {
        id: 'notMarking',
        name: 'notMarking',
        component: 'switch',
        label: 'Не подлежит маркировке',
      },
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
        required: true,
      },
      {
        id: 'tnved',
        name: 'tnved',
        component: 'input',
        label: 'ТН ВЭД',
        required: true,
      },
      {
        id: 'shelfLifeValue',
        name: 'shelfLifeValue',
        component: 'input',
        inputType: 'number',
        label: 'Срок годности',
        required: true,
      },
      {
        id: 'shelfLifeUnit',
        name: 'shelfLifeUnit',
        component: 'select',
        options: shelfLifeOptions,
        label: 'Срок годности (ед. изм.)',
        required: true,
      },
      {
        id: 'shelfLifeUnit',
        name: 'shelfLifeUnit',
        component: 'select',
        options: shelfLifeOptions,
        label: 'Срок годности (ед. изм.)',
        required: true,
      },
      {
        id: 'useStateRegistration',
        name: 'useStateRegistration',
        component: 'switch',
        label: 'Требуется свидетельство государственной регистрации',
      },
      {
        id: 'useCertificate',
        name: 'useCertificate',
        component: 'switch',
        label: 'Требуется сертификат соответствия',
      },
      {
        id: 'usageType',
        name: 'usageType',
        component: 'select',
        options: usageTypesOptions,
        label: 'Тип производства',
        required: true,
      },
      {
        id: 'useVsd',
        name: 'useVsd',
        component: 'switch',
        label: 'Требуется ВСД',
      },
      {
        id: 'useLicense',
        name: 'useLicense',
        component: 'switch',
        label: 'Разрешительная документация',
      },
    ],
  } as const;
};
export { schemeFormProduct };

export const initialValues = {
  name: 'Продукт №',
  useStateRegistration: false,
  useCertificate: false,
  useDeclaration: false,
  useLicense: false,
  useVsd: false,
  notMarking: false,
};
