import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback, type JSX } from 'react';
import { Badge } from '@shared/components/ui/badge';
import { normalizePath } from '@mrdn/app-common';
import { ErrorCard } from '@mrdn/app-common';
import ErrorPageContainer from './Container';
import { PATHS } from '@shared/config/pathRoute';

function Forbidden(): JSX.Element {
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
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.getAttribute('contenteditable') === 'true');
      if (isInputTarget) return;

      if (
        (e.key === 'r' || e.key === 'R' || e.code === 'KeyR') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        onReload();
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        navigate(pathMain);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onReload, pathMain]);

  return (
    <ErrorPageContainer>
      <ErrorCard
        kind="forbidden"
        code={403}
        currentPath={location.pathname}
        onRetry={onReload}
        homeHref={PATHS.signIn}
        adminMailto="support@factory.local"
        BadgeComponent={({ children, className }) => (
          <Badge variant="outline" className={className}>
            {children}
          </Badge>
        )}
      />
    </ErrorPageContainer>
  );
}

export default Forbidden;
