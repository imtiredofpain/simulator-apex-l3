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
      <SidebarProvider className="control-surface h-screen w-screen" defaultOpen>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <div className="flex flex-col w-full h-full">
            <HeaderBar />
            <main className="h-full overflow-auto px-3 pb-3 pt-2 lg:px-5 lg:pb-5">
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
