import type { LoadStep } from './types';

const STEPS: LoadStep[] = [
  {
    key: 'profile',
    title: 'Получаем Ваши пользовательские данные',
    description: 'Имя, фамилия, должность и т.д.',
    status: 'pending',
  },
  {
    key: 'roles',
    title: 'Загружаем права доступа',
    description: 'Доступ к разделам приложения',
    status: 'pending',
  },
  {
    key: 'plants',
    title: 'Загружаем производственные участки',
    description: 'Список всех линий и участков',
    status: 'pending',
  },
  {
    key: 'references',
    title: 'Подтягиваем справочники',
    description: 'Номенклатура, единицы измерения и пр.',
    status: 'pending',
  },
  {
    key: 'settings',
    title: 'Настраиваем рабочее окружение',
    description: 'Предпочтения пользователя и кеш',
    status: 'pending',
  },
];

export default STEPS;
