import type { BatteryInfo } from './types';
import { usePowerSavingStore } from './store';

// --- Battery (best-effort; в некоторых браузерах недоступно)
interface BatteryManagerLike extends EventTarget {
  charging: boolean;
  level: number; // 0..1
}

function getBattery(): Promise<BatteryInfo> {
  const navAny = navigator as Navigator & {
    getBattery?: () => Promise<BatteryManagerLike>;
  };
  if (!navAny.getBattery) {
    return Promise.resolve({ supported: false, level: null, charging: null });
  }
  return navAny
    .getBattery()
    .then((bm) => ({
      supported: true,
      level: typeof bm.level === 'number' ? bm.level : null,
      charging: typeof bm.charging === 'boolean' ? bm.charging : null,
    }))
    .catch(() => ({ supported: false, level: null, charging: null }));
}

export function initBatteryWatcher(): () => void {
  let cleanup: (() => void) | null = null;
  const apply = (info: BatteryInfo) => {
    usePowerSavingStore.getState().updateSignals({
      batterySupported: info.supported,
      batteryLevel: info.level,
      batteryCharging: info.charging,
    });
  };

  getBattery().then((info) => {
    apply(info);
    const navAny = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    if (!navAny.getBattery) return;

    navAny
      .getBattery?.()
      .then((bm) => {
        const onLevel = () =>
          apply({ supported: true, level: bm.level, charging: bm.charging });
        const onCharge = () =>
          apply({ supported: true, level: bm.level, charging: bm.charging });
        bm.addEventListener?.('levelchange', onLevel as EventListener);
        bm.addEventListener?.('chargingchange', onCharge as EventListener);
        cleanup = () => {
          bm.removeEventListener?.('levelchange', onLevel as EventListener);
          bm.removeEventListener?.('chargingchange', onCharge as EventListener);
        };
      })
      .catch(() => {
        /* ignore */
      });
  });

  return () => {
    cleanup?.();
  };
}

// --- Save-Data
export function initSaveDataWatcher(): () => void {
  const conn = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (t: string, cb: () => void) => void;
        removeEventListener?: (t: string, cb: () => void) => void;
      };
    }
  ).connection;
  const apply = () => {
    usePowerSavingStore
      .getState()
      .updateSignals({ saveData: Boolean(conn?.saveData) });
  };
  apply();
  const onChange = () => apply();
  conn?.addEventListener?.('change', onChange);
  return () => conn?.removeEventListener?.('change', onChange);
}

// --- Reduced Motion
export function initReducedMotionWatcher(): () => void {
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const apply = () =>
    usePowerSavingStore
      .getState()
      .updateSignals({ prefersReducedMotion: Boolean(mq?.matches) });
  apply();
  const onChange = () => apply();
  mq?.addEventListener?.('change', onChange);
  return () => mq?.removeEventListener?.('change', onChange);
}

// --- Low FPS detector (скользящее окно)
export function initLowFpsWatcher(
  thresholdFps = 30,
  sampleMs = 3000
): () => void {
  let rafId = 0;
  const deltas: number[] = [];
  let last = performance.now();

  const tick = (t: number) => {
    const dt = t - last;
    last = t;
    deltas.push(dt);
    // window до sampleMs
    while (deltas.length > 2 && deltas.reduce((a, b) => a + b, 0) > sampleMs) {
      deltas.shift();
    }
    const total = deltas.reduce((a, b) => a + b, 0);
    const avg = total / Math.max(1, deltas.length);
    const fps = 1000 / avg;

    const low = fps < thresholdFps;
    usePowerSavingStore.getState().updateSignals({ lowFps: low });

    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}
