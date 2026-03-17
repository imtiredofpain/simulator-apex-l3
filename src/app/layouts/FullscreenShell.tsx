import { RegisterSettingRenderers, SettingsDialog } from '@features/Settings';
import { PowerSavingBridge } from '@shared/processes/power-saving/ui/PowerSavingBridge';
import { Outlet } from 'react-router-dom';

/**
 * Макет для полноэкранных страниц (дашборды, редакторы, canvas).
 * Никакой обвязки — просто full-screen контейнер.
 */
export function FullscreenShell({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className="w-full h-full fullscreen-shell">
        {children ?? <Outlet />}
      </div>
      <SettingsDialog />
      <RegisterSettingRenderers />
      <PowerSavingBridge />
    </>
  );
}
