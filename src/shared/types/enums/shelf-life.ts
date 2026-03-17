export const ShelfLife = {
  '0': {
    name: 'YEAR',
    description: 'Год',
  },
  '1': {
    name: 'MONTH',
    description: 'Месяц',
  },
  '2': {
    name: 'WEEK',
    description: 'Неделя',
  },
  '3': {
    name: 'DAY',
    description: 'День',
  },
  '4': {
    name: 'HOUR',
    description: 'Час',
  },
  '5': {
    name: 'MINUTE',
    description: 'Минута',
  },
  '6': {
    name: 'SECOND',
    description: 'Секунда',
  },
  '7': {
    name: 'MILLISECOND',
    description: 'Миллисекунда',
  },
  '10': {
    name: 'NaN',
    description: 'NaN',
  },
} as const;

export type TShelfLife = keyof typeof ShelfLife;
