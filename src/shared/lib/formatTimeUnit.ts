import { ruPlural } from '@mrdn/app-common';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';

export const formatTimeUnit = (
  number: number,
  unitKey: keyof EnumsUnits
): string => {
  let forms: [string, string, string];

  switch (unitKey) {
    case 'YEAR': // YEAR
      forms = ['год', 'года', 'лет'];
      break;
    case 'MONTH': // MONTH
      forms = ['месяц', 'месяца', 'месяцев'];
      break;
    case 'WEEK': // WEEK
      forms = ['неделя', 'недели', 'недель'];
      break;
    case 'DAY': // DAY
      forms = ['день', 'дня', 'дней'];
      break;
    case 'HOUR': // HOUR
      forms = ['час', 'часа', 'часов'];
      break;
    case 'MINUTE': // MINUTE
      forms = ['минута', 'минуты', 'минут'];
      break;
    case 'SECOND': // SECOND
      forms = ['секунда', 'секунды', 'секунд'];
      break;
    case 'MILLISECOND': // MILLISECOND
      forms = ['миллисекунда', 'миллисекунды', 'миллисекунд'];
      break;
    case 'NaN': // NaN
      return 'NaN';
    default:
      throw new Error('Unknown unit key');
  }
  return ruPlural(number, forms);
};
