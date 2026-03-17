import useHasLogin from '@features/Auth/hooks/useHasLogin';
import { RegisterSettingRenderers, SettingsDialog } from '@features/Settings';
import { SidebarProvider, SidebarInset } from '@shared/components/ui/sidebar';
import { Navigate, Outlet } from 'react-router-dom';
import LogOutDialog from '@features/Auth/ui/Log-outDialog';
import { HeaderBar } from '@features/Header';
import { PowerSavingBridge } from '@shared/processes/power-saving/ui/PowerSavingBridge';
import { AppSidebar } from '@shared/components/Sidebar/ui';
import { PATHS } from '@shared/config/pathRoute';

export function AppShell() {
  const { data, isLoading } = useHasLogin();

  if (!data?.isValid && !isLoading) {
    return <Navigate to={PATHS.signIn} replace />;
  }

  return (
    <>
      <SidebarProvider className="w-screen h-screen" defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col w-full h-full">
            <HeaderBar />
            <main className="h-full overflow-auto pt-2 pr-2 pb-2">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <LogOutDialog />
      <SettingsDialog />
      <RegisterSettingRenderers />
      <PowerSavingBridge />
    </>
  );
}
