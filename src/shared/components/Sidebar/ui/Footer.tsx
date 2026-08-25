import { useLogoutUrlParam } from '@features/Auth';
import { useSettingsDialogQuery } from '@features/Settings/model/hooks';
import useMe from '@features/Users/hooks/useMe';
import { Button } from '@shared/components/ui/button';
import { SidebarFooter } from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';
// import { useDevtools } from '@shared/hooks/useDevtools';
// import { useKiosk } from '@shared/hooks/useKiosk';
import { cn } from '@shared/lib/utils';
import { LogOut, Settings } from 'lucide-react';
import { memo } from 'react';

interface SidebarFooterCompProps {
  isOpen: boolean;
}

function SidebarFooterComp({ isOpen }: SidebarFooterCompProps) {
  const { isLoading: userIsLoading } = useMe();
  const { openDialog } = useSettingsDialogQuery();
  const { open: openLogout } = useLogoutUrlParam();
  return (
    <SidebarFooter className="gap-1.5 p-3">
      {userIsLoading && <Skeleton className="w-full h-9!" />}
      <Button
        variant="ghost"
        onClick={() => {
          openDialog('general');
        }}
        className={cn(
          'h-10 rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white',
          isOpen ? 'justify-start text-left' : 'justify-center'
        )}
      >
        <Settings className="w-4.5! h-4.5!" />
        {isOpen && 'Настройки'}
      </Button>
      <Button
        variant="ghost"
        onClick={openLogout}
        className={cn(
          'h-10 rounded-xl text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-300',
          isOpen ? 'justify-start text-left' : 'justify-center'
        )}
      >
        <LogOut className="w-4.5! h-4.5! text-red-500" />
        {isOpen && 'Выход из системы'}
      </Button>
    </SidebarFooter>
  );
}

export default memo(SidebarFooterComp);
