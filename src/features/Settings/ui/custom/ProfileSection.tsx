import * as React from 'react';
import { memo } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@shared/components/ui/avatar';
import { Skeleton } from '@shared/components/ui/skeleton';
import { UserRoundX, AtSign, Shield, LogOut } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import useMe from '@features/Users/hooks/useMe';
import LogoME from '@assets/logos/apex_logo.svg';
import type { SectionRendererProps } from '@features/Settings/registry/section';
import { useLogoutUrlParam } from '@features/Auth';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return letters.toUpperCase() || '·';
}

const ProfileSection: React.FC<SectionRendererProps> = ({ t }) => {
  const { data: me, isLoading } = useMe();
  const { open: openLogout } = useLogoutUrlParam();

  const fullName = [
    me?.user?.lastName,
    me?.user?.firstName,
    me?.user?.patronymic,
  ]
    .filter(Boolean)
    .join(' ');
  const name = fullName
    ? fullName
    : me?.user?.login === 'root'
    ? 'Меридиан Инжиниринг'
    : 'Без имени';

  const subtitle = me?.user?.login;
  const avatarUrl = me?.user?.login === 'root' ? LogoME : '';

  if (isLoading) {
    return (
      <div className="max-w-xl px-4 py-8 mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar */}
          <Skeleton className="rounded-full h-28 w-28" />

          {/* Name */}
          <Skeleton className="w-56 rounded h-7" />

          {/* Chips row */}
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="h-6 rounded-full w-28" />
          </div>

          {/* Divider */}
          <div className="w-full h-px mt-2 bg-border/60" />

          {/* Meta rows */}
          <div className="grid w-full grid-cols-1 gap-3">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-20 h-4 rounded" />
              <Skeleton className="h-4 rounded w-28" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
          </div>

          {/* Logout button placeholder */}
          <Skeleton className="w-64 rounded-md h-9" />
        </div>
      </div>
    );
  }

  if (!me?.user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center border rounded-lg bg-muted/40 border-border/50">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <UserRoundX className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">
            {t('auth.notLoggedInTitle') ?? 'Вы не вошли в систему'}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Войдите, чтобы увидеть информацию профиля
          </div>
        </div>
        <Button
          variant="default"
          className="px-5 mt-2"
          onClick={() => {
            window.location.href = '/login'; // или navigate('/login')
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Войти в систему
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl px-4 py-6 mx-auto">
      <div className="flex flex-col items-center gap-6">
        <Avatar className="h-28 w-28">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="text-lg font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <div className="text-3xl font-semibold leading-tight tracking-tight">
            {name}
          </div>
          {subtitle ? (
            <div className="inline-flex flex-wrap items-center justify-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <AtSign className="w-4 h-4" />
                {subtitle}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1">
                <Shield className="w-4 h-4" />
                role: {me.user.roleId}
              </span>
            </div>
          ) : null}
        </div>

        <div className="w-full h-px mt-4 bg-border/60" />

        <div className="grid w-full grid-cols-1 gap-3 text-sm text-center text-muted-foreground">
          <div className="inline-flex items-center justify-center gap-2 leading-relaxed">
            <AtSign className="w-4 h-4" />
            <span className="text-foreground/80">Логин:</span>
            <span className="font-medium text-foreground">{me.user.login}</span>
          </div>
          <div className="inline-flex items-center justify-center gap-2 leading-relaxed">
            <Shield className="w-4 h-4" />
            <span className="text-foreground/80">Роль ID:</span>
            <span className="font-medium text-foreground">
              {me.user.roleId}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            size="default"
            className="px-4"
            onClick={openLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Выйти из учетной записи
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileSection);
