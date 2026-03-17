type UnitType =
  | 'string'
  | 'number'
  | 'range'
  | 'duration'
  | 'timestamp'
  | 'percent';

export interface UnitConfig {
  accuracy?: number;
  name?: string;
  scaling?: boolean;
  type?: UnitType;
  beautiful?: boolean;
  visible?: boolean;
  separateUnitAndValue?: boolean;
  isNotString?: boolean;
  format?: string;
}

interface ReplaceResult {
  value: string | number;
  label: string;
}

export function formatByUnit(
  value: number,
  unit: UnitConfig,
  replace: true
): ReplaceResult;

export function formatByUnit(
  value: number,
  unit: UnitConfig,
  replace?: false
): string;

/**
 * Форматирует значение согласно конфигурации единицы измерения.
 *
 * @param {number} value - Значение для форматирования.
 * @param {UnitConfig} unit - Конфигурация единицы измерения.
 * @param {boolean} [replace=false] - Если true, возвращает объект с лейблом и значением.
 * @returns {string | ReplaceResult} Отформатированная строка или объект.
 *
 * @example
 * formatByUnit(1000, { type: "percent", accuracy: 1 });
 * // "100 000.0"
 */
export function formatByUnit(
  value: number,
  unit: UnitConfig,
  replace: boolean = false
): string | ReplaceResult {
  if (value == null || typeof unit !== 'object') {
    throw new Error('Invalid arguments: value or unit is incorrect');
  }

  let {
    accuracy = 0,
    name = "",
    scaling = false,
    type = "string",
    beautiful = true,
    visible = true,
    separateUnitAndValue = true,
    isNotString = undefined,
    format = "d.m.y h:i:s:ms",
  } = unit;

  let formattedValue: string | number = value;

  switch (type) {
    case 'string':
      return replace ? { value, label: '' } : value.toString();
    case 'range':
      const rangeValue = normalizeTimer(value, true);
      return replace ? { value: rangeValue, label: '' } : rangeValue;
    case 'duration':
      const duration = `${formatDuration(
        value,
        undefined,
        undefined,
        isNotString
      )}`.trim();
      return replace ? { value: duration, label: '' } : duration;
    case 'timestamp':
      const timestamp = normalizeDateTime(value, format);
      return replace ? { value: timestamp, label: '' } : timestamp;
    case 'percent':
      formattedValue = value * 100;
      break;
  }

  if (scaling) {
    const fm = formatDischargeNumber(value, name);
    formattedValue = fm.formattedValue;
    name = fm.name;
  }

  formattedValue = parseFloat((formattedValue as number).toFixed(accuracy));

  if (beautiful) {
    formattedValue = (formattedValue as number).toLocaleString('ru-RU', {
      minimumFractionDigits: accuracy,
      maximumFractionDigits: accuracy,
    });
  }

  if (visible) {
    const words = [formattedValue, name];
    formattedValue = words.join(separateUnitAndValue ? ' ' : '');
  }

  return replace
    ? { value: formattedValue, label: name }
    : `${formattedValue}`.trim();
}

if (typeof window !== 'undefined') {
  (window as any).formatByUnit = formatByUnit;
}

/**
 * Форматирует продолжительность в человеко-читаемую строку.
 *
 * @param {number} duration - Продолжительность в миллисекундах.
 * @param {number} [threshold=1] - Порог в миллисекундах для включения мелких единиц.
 * @param {number} [hourThreshold=0] - Порог часов, после которого длительность разбивается на дни и месяцы.
 * @param {boolean} [isTimeString=false] - Если true, возвращает строку в формате HH:MM:SS.
 * @returns {string} Отформатированная строка продолжительности.
 *
 * @example
 * formatDuration(90061);
 * // "1мин 30сек"
 */
export function formatDuration(
  duration: number,
  threshold: number = 1,
  hourThreshold: number = 0, // 999999999999,
  isTimeString: boolean = false
): string {
  if (isTimeString) {
    let totalSeconds = Math.floor(duration / 1000);
    let seconds = totalSeconds % 60;
    let totalMinutes = Math.floor(totalSeconds / 60);
    let minutes = totalMinutes % 60;
    let totalHours = Math.floor(totalMinutes / 60);

    if (hourThreshold === 0) {
      return `${String(totalHours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
      )}:${String(seconds).padStart(2, '0')}`;
    } else {
      let days = Math.floor(totalHours / 24);
      let hours = totalHours % 24;

      if (days > 0) {
        return `${String(days).padStart(2, '0')} ${String(hours).padStart(
          2,
          '0'
        )}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
          2,
          '0'
        )}`;
      } else {
        return `${String(totalHours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }
  }

  let milliseconds = duration % 1000;
  let sDuration = (duration - milliseconds) / 1000;
  let seconds = sDuration % 60;
  sDuration = (sDuration - seconds) / 60;
  let minutes = sDuration % 60;
  sDuration = (sDuration - minutes) / 60;
  let hours = sDuration;

  let days = 0;
  let months = 0;
  let years = 0;

  if (hours > hourThreshold) {
    days = Math.floor(hours / 24);
    hours = hours % 24;

    months = Math.floor(days / 30);
    days = days % 30;

    years = Math.floor(months / 12);
    months = months % 12;
  }

  const resultString: string[] = [];

  if (years > 0) resultString.push(`${years}г`);
  if (months > 0) resultString.push(`${months}мес`);
  if (days > 0) resultString.push(`${days}д`);
  if (hours > 0) resultString.push(`${hours}ч`);
  if (minutes > 0) resultString.push(`${minutes}мин`);

  if (duration < threshold) {
    if (seconds > 0) resultString.push(`${seconds}сек`);
    if (milliseconds > 0) resultString.push(`${milliseconds}мс`);
  } else if (resultString.length === 0 && duration > 0) {
    if (seconds > 0) {
      resultString.push(`${seconds}сек`);
    } else if (milliseconds > 0) {
      resultString.push(`${milliseconds}мс`);
    }
  }

  if (resultString.length === 0) {
    resultString.push('0мс');
  }

  return resultString.join(' ');
}

/**
 * Форматирует большое число в читаемую форму с разрядностью.
 *
 * @param {number} value - Значение.
 * @param {string} [name=""] - Название единицы, которое будет добавлено к суффиксу.
 * @returns {{ formattedValue: number; name: string }} Отформатированное значение и название единицы.
 *
 * @example
 * formatDischargeNumber(1200000, "байт");
 * // { formattedValue: 1.2, name: "млн. байт" }
 */
export function formatDischargeNumber(
  value: number,
  name: string = ''
): { formattedValue: number; name: string } {
  const units = [
    {
      threshold: 1_000_000_000_000_000_000,
      divisor: 1_000_000_000_000_000_000,
      label: 'квинтлн.',
    },
    {
      threshold: 1_000_000_000_000_000,
      divisor: 1_000_000_000_000_000,
      label: 'квадрлн.',
    },
    {
      threshold: 1_000_000_000_000,
      divisor: 1_000_000_000_000,
      label: 'трлн.',
    },
    { threshold: 1_000_000_000, divisor: 1_000_000_000, label: 'млрд.' },
    { threshold: 1_000_000, divisor: 1_000_000, label: 'млн.' },
    { threshold: 1_000, divisor: 1_000, label: 'тыс.' },
  ];

  let formattedValue = value;
  let unitLabel = '';

  for (const unit of units) {
    if (Math.abs(value) >= unit.threshold) {
      formattedValue = value / unit.divisor;
      unitLabel = unit.label;
      break;
    }
  }

  return { formattedValue, name: unitLabel ? `${unitLabel} ${name}` : name };
}

/**
 * Нормализует время (в миллисекундах) в строку.
 *
 * @param {number} milliseconds - Продолжительность в миллисекундах.
 * @param {boolean} analyticsTextDate - Флаг текстового или числового форматирования.
 * @returns {string} Форматированное время.
 *
 * @example
 * normalizeTimer(3661000, true);
 * // "1 ч 1 мин 1 сек"
 */
export const normalizeTimer = (
  milliseconds: number,
  analyticsTextDate: boolean
): string => {
  milliseconds = Math.floor(milliseconds / 1000);

  let out = '';
  let hour: number | string = 0,
    minute: number | string = 0,
    second: number | string = 0;

  if (milliseconds >= 86400) {
    hour = Math.floor(milliseconds / 3600);
    minute = Math.floor((milliseconds - +hour * 3600) / 60);
    second = milliseconds - +hour * 3600 - +minute * 60;
  } else if (milliseconds >= 3600) {
    hour = Math.floor(milliseconds / 3600);
    minute = Math.floor((milliseconds - +hour * 3600) / 60);
    second = milliseconds - +hour * 3600 - +minute * 60;
  } else if (milliseconds >= 60) {
    minute = Math.floor(milliseconds / 60);
    second = milliseconds - +minute * 60;
  } else {
    second = milliseconds;
  }

  if (analyticsTextDate) {
    if (+hour > 0) {
      out = `${hour} ч ${minute} мин ${second} сек`;
    } else if (+minute > 0) {
      out = `${minute} мин ${second} сек`;
    } else if (+second > 0) {
      out = `${second} сек`;
    } else {
      out = `0 сек`;
    }
  } else {
    if (+hour < 10) hour = '0' + hour;
    if (+minute < 10) minute = '0' + minute;
    if (+second < 10) second = '0' + second;

    out = `${hour}:${minute}:${second}`;
  }

  return out;
};

/**
 * Преобразует миллисекунды в отформатированную строку даты и времени.
 *
 * Поддерживает шаблоны:
 * - d: день (с ведущим нулём)
 * - m: месяц (с ведущим нулём)
 * - y: год
 * - h: часы
 * - i: минуты
 * - s: секунды
 * - D: день недели
 * - M: короткое название месяца
 * - FM: полное название месяца
 * - Y: год (тот же, что и 'y')
 *
 * @param {number} milliseconds - Метка времени (ms или s).
 * @param {string} [format="d.m.y h:i:s"] - Строка формата.
 * @param {boolean} [timezone=false] - Учитывать ли часовой пояс.
 * @returns {string} Отформатированная строка даты и времени.
 *
 * @example
 * normalizeDateTime(Date.now(), "D, d M Y h:i:s");
 * // "Пт, 07 Ноя 2025 14:55:00"
 */
export const normalizeDateTime = (
  milliseconds: number,
  format: string = 'd.m.y h:i:s',
  timezone: boolean = false
): string => {
  if (milliseconds.toString().length < 13) {
    milliseconds *= 1000;
  }

  if (timezone) {
    const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
    milliseconds += timezoneOffset;
  }

  const date = new Date(milliseconds);
  const y = date.getFullYear();
  let m: string | number = date.getMonth() + 1;
  let d: string | number = date.getDate();
  let h: string | number = date.getHours();
  let i: string | number = date.getMinutes();
  let s: string | number = date.getSeconds();
  let ms: string | number = date.getMilliseconds();
  const D = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][date.getDay()];
  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];
  const monthNamesFull = [
    ["Январь", "Января"],
    ["Февраль", "Февраля"],
    ["Март", "Марта"],
    ["Апрель", "Апреля"],
    ["Май", "Мая"],
    ["Июнь", "Июня"],
    ["Июль", "Июля"],
    ["Август", "Августа"],
    ["Сентябрь", "Сентября"],
    ["Октябрь", "Октября"],
    ["Ноябрь", "Ноября"],
    ["Декабрь", "Декабря"],
  ];
  const M = monthNames[date.getMonth()];
  // Если перед FM идет d, то возвращаем monthNamesFull[][1]
  const FM = /d(\.|\s|)FM/uig.test(format) ? monthNamesFull[m - 1][1] : monthNamesFull[m - 1][0];

  m = +m < 10 ? "0" + m : m;
  d = +d < 10 ? "0" + d : d;
  h = +h < 10 ? "0" + h : h;
  i = +i < 10 ? "0" + i : i;
  s = +s < 10 ? "0" + s : s;
  ms = +ms < 10 ? "0" + ms : ms;

  return format
    .replace("ms", ms.toString())
    .replace("d", d.toString())
    .replace("m", m.toString())
    .replace("y", y.toString())
    .replace("h", h.toString())
    .replace("i", i.toString())
    .replace("s", s.toString())
    .replace("D", D)
    .replace("FM", FM)
    .replace("M", M)
    .replace("Y", y.toString());
};
