import { z } from 'zod';
import type { ThemeValue } from './types';

export const zBoolean = z.boolean();
export const zString = z.string();
export const zStringArray = z.array(z.string());
export const zTheme: z.ZodType<ThemeValue> = z.custom<ThemeValue>(
  (v) => v === 'light' || v === 'dark' || v === 'system',
);
