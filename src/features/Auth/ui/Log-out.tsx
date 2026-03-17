import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import useLogout, { type LogoutStatus } from '../hooks/useLogout';
import { useCallback } from 'react';
import { Spin } from '@mrdn/app-common';

export interface LogOutConfirmDialogProps {
  /** Открыто ли модальное окно */
  open: boolean;
  /** Колбэк для управления состоянием открытия */
  onOpenChange: (open: boolean) => void;
  /** Колбэк после успешного завершения логаута (любой статус "ok|no_token|unauthorized|...") */
  onLoggedOut?: (status: LogoutStatus) => void;
  /** Токен пользователя */
  token: string;
}

/**
 * Модальное окно подтверждения выхода из учётной записи.
 * Основано на shadcn/ui `Dialog` + кнопки `Button`.
 */
export function LogOutConfirmDialog({
  open,
  onOpenChange,
  onLoggedOut,
}: LogOutConfirmDialogProps) {
  const { mutate: logout, isPending } = useLogout({
    onSuccess: ({ status }) => {
      onLoggedOut?.(status);
      onOpenChange(false);
    },
  });

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выйти из аккаунта?</DialogTitle>
          <DialogDescription>
            Вы будете деавторизованы на этом устройстве. Данные, зависящие от
            сессии, будут очищены.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Отмена
          </Button>
          <Button
            variant={isPending ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spin size={16} width={3} className="invert" />
                <span className="text-sm text-muted-foreground">
                  Выходим...
                </span>
              </div>
            ) : (
              'Выйти'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
