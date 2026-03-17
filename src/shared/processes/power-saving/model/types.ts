export type PowerSavingMode = 'off' | 'auto' | 'on';

export type Reason =
  | 'user-on'
  | 'user-off'
  | 'battery-low'
  | 'save-data'
  | 'reduced-motion'
  | 'low-fps';

export interface Signals {
  batterySupported: boolean;
  batteryLevel: number | null; // 0..1
  batteryCharging: boolean | null;
  saveData: boolean; // navigator.connection?.saveData
  prefersReducedMotion: boolean; // matchMedia('(prefers-reduced-motion: reduce)')
  lowFps: boolean; // детектор просадки FPS
}

export interface PowerSavingState {
  mode: PowerSavingMode;
  signals: Signals;
  enabled: boolean; // ЭТО — итог, без auto
  reasons: ReadonlyArray<Reason>;
  lastChangedAt: number | null;

  setMode: (mode: PowerSavingMode) => void;
  updateSignals: (patch: Partial<Signals>) => void;
  recompute: () => void;
}

export interface BatteryInfo {
  supported: boolean;
  level: number | null;
  charging: boolean | null;
}
