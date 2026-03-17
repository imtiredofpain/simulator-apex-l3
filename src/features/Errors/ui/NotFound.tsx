import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback, type JSX } from 'react';
import { Badge } from '@shared/components/ui/badge';
import { normalizePath } from '@mrdn/app-common';
import { ErrorCard } from '@mrdn/app-common';
import { PATHS } from '@shared/config/pathRoute';
import { cn } from '@shared/lib/utils';

interface NotFoundProps {
  title?: string;
}

function NotFound(props: NotFoundProps): JSX.Element {
  const { title } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const pathMain: string = useMemo(() => normalizePath(PATHS.home), []);

  const onReload = useCallback((): void => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.repeat) return;
      const isInputTarget: boolean =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.getAttribute("contenteditable") === "true");
      if (isInputTarget) return;

      if (
        (e.key === "r" || e.key === "R" || e.code === "KeyR") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        onReload();
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        navigate(pathMain);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, onReload, pathMain]);

  return (
    <div
      className="w-full min-h-dvh overflow-hidden p-0 bg-background bg-linear-to-b from-background to-[#1a84ec4d]"
      aria-labelledby="forbidden-title"
      aria-describedby="forbidden-desc"
      role="region"
    >
      <div className="flex items-center justify-center p-4 min-h-dvh">
        <div className="w-full max-w-3xl">
          <ErrorCard
            kind="not_found"
            code={404}
            title={title}
            currentPath={location.pathname}
            onRetry={onReload}
            homeHref={PATHS.home}
            adminMailto="support@factory.local"
            BadgeComponent={({ children, className }) => (
              <Badge
                variant="outline"
                className={cn(
                  className,
                  "whitespace-nowrap truncate flex flex-end max-w-[300px] overflow-hidden text-right"
                )}
              >
                {children}
              </Badge>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default NotFound;
