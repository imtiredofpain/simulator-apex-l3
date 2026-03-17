import { Link } from 'react-router-dom';
import * as React from 'react';
import type { SidebarRendererProps } from '@features/Settings/registry/sidebar';
import { memo } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@shared/components/ui/avatar';
import useMe from '@features/Users/hooks/useMe';
import LogoME from '@assets/logos/apex_logo.svg';
import { UserRoundX } from 'lucide-react';
import { Skeleton } from '@shared/components/ui/skeleton';

// interface ProfileMeta {
//   avatarUrl?: string;
//   name?: string;
//   subtitle?: string;
// }

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return letters.toUpperCase() || '·';
}

const SidebarProfileCard: React.FC<SidebarRendererProps> = ({
  active,
  path,
}) => {
  const { data: me, isLoading } = useMe();

  const name = me?.user?.lastName
    ? `${me.user.lastName} ${me.user.firstName}`
    : me?.user?.firstName
    ? me.user.firstName
    : me?.user?.login === 'root'
    ? 'Меридиан Инжиниринг'
    : 'Без имени';
  const subtitle = me?.user?.login;
  const avatarUrl = me?.user?.login === 'root' ? LogoME : '';

  if (isLoading) {
    return (
      <button
        type="button"
        className={['w-full rounded-lg px-3 py-2 flex items-center gap-3'].join(
          ' '
        )}
      >
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="w-3/4 h-4 mb-2 rounded" />
          <Skeleton className="w-1/2 h-3 rounded" />
        </div>
      </button>
    );
  }

  if (!me?.user) {
    return (
      <button
        type="button"
        className={[
          'w-full rounded-lg px-3 py-2 pl-4 flex items-center gap-3 transition-colors',
          'bg-red-500/8',
        ].join(' ')}
      >
        <UserRoundX className="shrink-0 w-4 h-4 text-red-500" />
        <div className="min-w-0 text-xs text-left">
          <div className="font-bold">Вход не выполнен</div>
          <div className="text-xs text-muted-foreground">
            Войдите в систему, чтобы увидеть свою информацию
          </div>
        </div>
      </button>
    );
  }

  return (
    <Link to={path} tabIndex={-1}>
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        title={name}
        className={[
          'w-full rounded-lg px-3 py-2 flex items-center gap-3 transition-colors',
          active ? 'bg-muted' : 'hover:bg-muted/50',
        ].join(' ')}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-left">
          <div className="text-sm leading-5 truncate">{name}</div>
          {subtitle ? (
            <div className="text-xs leading-4 truncate text-muted-foreground">
              {subtitle}
            </div>
          ) : null}
        </div>
      </button>
    </Link>
  );
};

export default memo(SidebarProfileCard);
