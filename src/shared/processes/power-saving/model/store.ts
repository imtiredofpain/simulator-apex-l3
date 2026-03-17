import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PowerSavingMode,
  PowerSavingState,
  Reason,
  Signals,
} from './types';

const initialSignals: Signals = {
  batterySupported: false,
  batteryLevel: null,
  batteryCharging: null,
  saveData: false,
  prefersReducedMotion: false,
  lowFps: false,
};

function decideEnabled(
  mode: PowerSavingMode,
  s: Signals
): { enabled: boolean; reasons: Reason[] } {
  if (mode === 'on') return { enabled: true, reasons: ['user-on'] };
  if (mode === 'off') return { enabled: false, reasons: ['user-off'] };

  // AUTO: строгие сигналы сначала
  if (
    s.batterySupported &&
    s.batteryCharging === false &&
    s.batteryLevel !== null &&
    s.batteryLevel <= 0.2
  ) {
    return { enabled: true, reasons: ['battery-low'] };
  }
  if (s.saveData) {
    return { enabled: true, reasons: ['save-data'] };
  }
  // мягкие сигналы
  if (s.prefersReducedMotion) {
    return { enabled: true, reasons: ['reduced-motion'] };
  }
  if (s.lowFps) {
    return { enabled: true, reasons: ['low-fps'] };
  }
  return { enabled: false, reasons: [] };
}

export const usePowerSavingStore = create<PowerSavingState>()(
  subscribeWithSelector((set, get) => ({
    mode: 'auto',
    signals: initialSignals,
    enabled: false,
    reasons: [],
    lastChangedAt: null,

    setMode: (mode) => {
      if (get().mode === mode) return;
      set({ mode });
      get().recompute();
    },

    updateSignals: (patch) => {
      const prev = get().signals;
      const next: Signals = { ...prev, ...patch };
      // no-op guard (typed keys)
      const changed = (Object.keys(patch) as Array<keyof Signals>).some(
        (k) => prev[k] !== next[k]
      );
      if (!changed) return;
      set({ signals: next });
      get().recompute();
    },

    recompute: () => {
      const { mode, signals, enabled: prevEnabled } = get();
      const { enabled, reasons } = decideEnabled(mode, signals);
      if (enabled !== prevEnabled) {
        set({ enabled, reasons, lastChangedAt: Date.now() });
        // CSS-класс на <html>
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('power-saving', enabled);
        }
      } else {
        set({ reasons });
      }
    },
  }))
);

// Селекторы для минимальных ререндеров
export const selectEnabled = (s: PowerSavingState): boolean => s.enabled;
export const selectMode = (s: PowerSavingState): PowerSavingMode => s.mode;
export const selectSignals = (s: PowerSavingState): Signals => s.signals;
export const selectReasons = (s: PowerSavingState): ReadonlyArray<Reason> =>
  s.reasons;
