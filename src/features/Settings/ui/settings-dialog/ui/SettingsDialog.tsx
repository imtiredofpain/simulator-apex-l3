import * as React from 'react';
import { useCallback, memo } from 'react';
import {
  useSearchParams as useRRSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';
import { SettingsContent } from './SettingsContent';
import { useSettingsDialogQuery } from '@features/Settings/model/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/ui/dialog';
import { Separator } from '@shared/components/ui/separator';

const SettingsDialog: React.FC = () => {
  // react-router-dom hooks
  const [searchParams] = useRRSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { open, path } = useSettingsDialogQuery();

  const clearParam = useCallback(() => {
    // Клонируем текущие параметры и удаляем settings
    const current = new URLSearchParams(searchParams.toString());
    current.delete('settings');

    // Собираем новый URL (тот же pathname, обновлённый search)
    const nextSearch = current.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true } // аналог router.replace(...)
    );
  }, [searchParams, navigate, location.pathname]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) clearParam();
      }}
    >
      <DialogTrigger asChild>
        <button className="hidden" aria-hidden />
      </DialogTrigger>

      <DialogContent className="max-w-[800px]! max-h-[85vh] bg-white dark:bg-sidebar px-0 pb-0 overflow-hidden">
        <DialogHeader className="px-6">
          <DialogTitle className="flex items-center gap-2 font-bold">
            Настройки
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-[250px_2px_1fr] -mt-4 h-[550px] max-h-[550px] overflow-hidden">
          <SettingsSidebar currentPath={path} />
          <Separator orientation="vertical" />
          <SettingsContent currentPath={path} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(SettingsDialog);
