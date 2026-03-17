'use client';

import { useEffect } from 'react';
import { usePowerSavingStore, selectEnabled } from '../model/store';
import {
  initBatteryWatcher,
  initSaveDataWatcher,
  initReducedMotionWatcher,
  initLowFpsWatcher,
} from '../model/detectors';
import type { PowerSavingMode } from '../model/types';
import { useSetting } from '@features/Settings/model/hooks';

export function PowerSavingBridge() {
  // настройка из settings
  const { value: mode } = useSetting<PowerSavingMode>('powerSavingMode');

  // применяем режим к стору энергосбережения
  useEffect(() => {
    usePowerSavingStore.getState().setMode(mode);
  }, [mode]);

  // включаем детекторы один раз
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanup = [
      initBatteryWatcher(),
      initSaveDataWatcher(),
      initReducedMotionWatcher(),
      initLowFpsWatcher(30, 3000),
    ];
    return () => cleanup.forEach((fn) => fn());
  }, []);

  // Пример: можно подписаться на enabled (если нужно выполнять побочные эффекты)
  const enabled = usePowerSavingStore(selectEnabled);
  useEffect(() => {
    // уже есть CSS-класс на <html> из самого стора, но сюда можно добавить любые эффекты
    // например: глобально глушить тяжелые превью/таймеры
    // console.log('PowerSaving enabled:', enabled);
  }, [enabled]);

  return null;
}
