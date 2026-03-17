import { cloneElement, isValidElement, useCallback } from 'react';
import type { LogoutStatus } from '../hooks/useLogout';
import { useLogoutUrlParam } from '../hooks/useLogoutUrlParam';
import { Button } from '@shared/components/ui/button';
import { LogOutConfirmDialog } from './Log-out';

/**
 * Контейнерный компонент, инкапсулирующий логику открытия/закрытия модалки выхода.
 * Принимает опциональный `trigger` — любой React-элемент, по клику на который откроется окно.
 * Если `trigger` не передан, рендерит стандартную кнопку "Выйти".
 */
export interface LogOutDialogProps {
  /** Кастомный триггер открытия. Если не передан — будет показана кнопка "Выйти". */
  trigger?: React.ReactNode;
  /** Колбэк после завершения логаута. */
  onLoggedOut?: (status: LogoutStatus) => void;
}

export default function LogOutDialog({
  trigger,
  onLoggedOut,
}: LogOutDialogProps) {
  type ClickableProps = { onClick?: React.MouseEventHandler<any> };
  const urlCtrl = useLogoutUrlParam();
  const open = urlCtrl.isRequested;

  const handleOpen = useCallback(() => {
    if (urlCtrl.isRequested) urlCtrl.open();
  }, [urlCtrl]);

  return (
    <>
      {trigger ? (
        // если передали кастомный триггер — оборачиваем его в клон с onClick
        isValidElement(trigger) ? (
          cloneElement<ClickableProps>(
            trigger as React.ReactElement<ClickableProps>,
            {
              onClick: (e) => {
                (
                  trigger as React.ReactElement<ClickableProps>
                ).props?.onClick?.(e);
                handleOpen();
              },
            }
          )
        ) : (
          trigger
        )
      ) : (
        <Button variant="ghost" onClick={handleOpen}>
          Выйти
        </Button>
      )}

      <LogOutConfirmDialog
        open={open}
        onOpenChange={(openNext) => {
          if (openNext) urlCtrl.open();
          else urlCtrl.close();
        }}
        token={urlCtrl.paramValue}
        onLoggedOut={onLoggedOut}
      />
    </>
  );
}
